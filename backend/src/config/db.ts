import mongoose from 'mongoose';
import Role from '../models/Role';
import ModCategories from '../models/ModCategories.js';
import { createSlug } from '../utils/slug.utils.js';
import config from './env';
import { RoleData } from '../types/Role';
import { readRolesFile } from './readJson';
import { CategoryData, SubCategory } from '../types/Categories';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename);
const ROLE_PATH = path.resolve(__dirname, './json/roles.json');
const CATEGORIES_PATH = path.resolve(__dirname, './json/categories.json');

async function initializeRoles(): Promise<void> {
  try {
    const roles: RoleData[] = await readRolesFile<RoleData[]>(ROLE_PATH);

    for (const role of roles) {
      const existingRole = await Role.findOne({ name: role.name });

      if (!existingRole) {
        await new Role({
          name: role.name,
          permissions: role.permissions,
        }).save();
        console.log(
          `Role ${role.name} with permissions: ${role.permissions} created.`,
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
    console.error(`Error while creating roles: ${error}`);
  }
}

async function initializeModCategories(): Promise<void> {
  try {
    const categories: CategoryData[] = await readRolesFile<CategoryData[]>(CATEGORIES_PATH);

    for (const category of categories) {
      const existingCategory = await ModCategories.findOne({
        name: category.name,
      });

      const subCategoriesWithSlugs: SubCategory[] = category.subCategory.map((sub) => ({
        name: sub,
        slug: createSlug(sub),
      }));

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
    console.error(`Error while creating category: ${error}`);
  }
}

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.mongoUri);
    await initializeRoles();
    await initializeModCategories();
    console.log(`Connected to mongo database: ${conn.connection.host}`);
  } catch (error: unknown) {
    console.error(`Error occured: ${error}`);
    process.exit(1);
  }
};
