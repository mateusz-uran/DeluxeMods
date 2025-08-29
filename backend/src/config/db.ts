import mongoose from 'mongoose';

import ModCategories from '../models/ModCategories';
import Role from '../models/Role';
import { CategoryData, SubCategory } from '../types/Categories';
import { RoleData } from '../types/Role';
import { logError } from '../utils/errors/logError';
import { createSlug } from '../utils/slug.utils';
import config from './env';
import { readCategories, readRoles } from './readJson';

async function initializeModCategories(): Promise<void> {
  try {
    const categories: CategoryData[] = await readCategories();

    for (const category of categories) {
      const existingCategory = await ModCategories.findOne({
        name: category.name,
      });

      const subCategoriesWithSlugs: SubCategory[] = category.subCategory.map(
        (sub) => ({
          name: sub,
          slug: createSlug(sub),
        }),
      );

      if (!existingCategory) {
        await new ModCategories({
          name: category.name,
          subCategory: subCategoriesWithSlugs,
        }).save();

        console.log(
          `Category ${
            category.name
          } with subcategories: ${subCategoriesWithSlugs
            .map((s) => `${s.name} (${s.slug})`)
            .join(', ')} created.`,
        );
      } else {
        const exsitingNames = new Set(
          existingCategory.subCategory.map((sc: SubCategory) => sc.name),
        );
        let modified = false;

        for (const sub of subCategoriesWithSlugs) {
          if (!exsitingNames.has(sub.name)) {
            existingCategory.subCategory.push(sub);
            modified = true;
            console.log(
              `Added subcategory '${sub.name}' to category '${category.name}'`,
            );
          }
        }

        if (modified) {
          await existingCategory.save();
        }
      }
    }
  } catch (error: unknown) {
    logError(error);
    throw error;
  }
}

async function initializeRoles(): Promise<void> {
  try {
    const roles: RoleData[] = await readRoles();

    for (const role of roles) {
      const existingRole = await Role.findOne({ name: role.name });

      if (!existingRole) {
        await new Role({
          name: role.name,
          permissions: role.permissions,
        }).save();
        console.log(
          `Role ${role.name} with permissions: ${JSON.stringify(role.permissions)} created.`,
        );
      } else {
        const currentPermissions = new Set<string>(existingRole.permissions);
        const newPermissions = role.permissions.filter(
          (p) => !currentPermissions.has(p),
        );

        if (newPermissions.length > 0) {
          existingRole.permissions.push(...newPermissions);
          await existingRole.save();
          console.log(
            `Role ${
              role.name
            } updated with new permissions: ${newPermissions.join(', ')}`,
          );
        } else {
          console.log(`Role ${role.name} already up to date.`);
        }
      }
    }
  } catch (error: unknown) {
    logError(error);
    throw error;
  }
}

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.mongoUri);
    await initializeRoles();
    await initializeModCategories();
    console.log(`Connected to mongo database: ${conn.connection.host}`);
  } catch (error: unknown) {
    logError(error);
    process.exit(1);
  }
};
