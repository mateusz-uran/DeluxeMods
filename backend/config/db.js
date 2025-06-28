import mongoose from "mongoose";
import Role from "../models/Role.js";
import ModCategories from "../models/ModCategories.js";
import { createSlug } from "../utils/slug.utils.js";

async function initializeRoles() {
  const roles = [
    { name: "ADMIN", permissions: ["ADD_USER", "READ_USERS", "UPDATE_USER"] },
    {
      name: "EDITOR",
      permissions: [
        "ACCEPT_REVIEW",
        "READ_ALL_REVIEWS",
        "UPDATE_REVIEW",
        "UPDATE_MOD",
      ],
    },
    {
      name: "REVIEWER",
      permissions: ["ADD_REVIEW", "EDIT_REVIEW", "READ_REVIEW"],
    },
  ];

  try {
    for (const role of roles) {
      const existingRole = await Role.findOne({ name: role.name });
      if (!existingRole) {
        await new Role({
          name: role.name,
          permissions: role.permissions,
        }).save();
        console.log(
          `Role ${role.name} with permissions: ${role.permissions} created.`
        );
      } else {
        const currentPermissions = new Set(existingRole.permissions);
        const newPermissions = role.permissions.filter(
          (p) => !currentPermissions.has(p)
        );

        if (newPermissions.length > 0) {
          existingRole.permissions.push(...newPermissions);
          await existingRole.save();
          console.log(
            `Role ${
              role.name
            } updated with new permissions: ${newPermissions.join(", ")}`
          );
        } else {
          console.log(`Role ${role.name} already up to date.`);
        }
      }
    }
  } catch (error) {
    console.error(`Error while creating roles: ${error.message}`);
  }
}

async function initializeModCategories() {
  const rawCategories = [
    { name: "Tractors", subCategory: ["Small", "Medium", "Big"] },
    { name: "Harvesters", subCategory: ["Combine", "Forage"] },
    { name: "Vehicles", subCategory: ["Trucks", "Car"] },
    {
      name: "Trailers",
      subCategory: [
        "Tipper",
        "Bale trailer",
        "Animal transport",
        "Mixer wagon",
        "Slurry tank",
        "Manure spreader",
        "Spreader",
        "Forage trailer",
      ],
    },
    {
      name: "Implements",
      subCategory: [
        "Mower",
        "Windrower",
        "Tedder",
        "Plow/Subsoiler",
        "Cultivator",
        "Seeder/Planter",
        "Sprayer",
      ],
    },
    {
      name: "Bailing",
      subCategory: ["Baler", "Wrapper"],
    },
    {
      name: "Loaders",
      subCategory: ["Telehandler", "Wheel loader"],
    },
    {
      name: "Maps",
      subCategory: ["EU", "US", "Other"],
    },
    {
      name: "Buildings",
      subCategory: ["Shed", "Silo", "House"],
    },
    {
      name: "Animals",
      subCategory: ["Cows", "Pigs", "Sheep/Goats", "Chickens", "Bees"],
    },
    {
      name: "Productions",
      subCategory: ["Factory", "Selling point", "Green house"],
    },
    {
      name: "Misc",
      subCategory: ["Driveable"],
    },
  ];

  try {
    for (const category of rawCategories) {
      const existingCategory = await ModCategories.findOne({
        name: category.name,
      });

      const subCategoriesWithSlugs = category.subCategory.map((sub) => ({
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
            .join(", ")} created.`
        );
      } else {
        const exsitingNames = new Set(
          existingCategory.subCategory.map((sc) => sc.name)
        );
        let modified = false;

        for (const sub of subCategoriesWithSlugs) {
          if (!exsitingNames.has(sub.name)) {
            existingCategory.subCategory.push(sub);
            modified = true;
            console.log(
              `Added subcategory '${sub.name}' to category '${category.name}'`
            );
          }
        }

        if (modified) {
          await existingCategory.save();
        }
      }
    }
  } catch (error) {
    console.error(`Error while creating category: ${error.message}`);
  }
}

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_DB_URI);
    await initializeRoles();
    await initializeModCategories();
    console.log(`Connected to mongo database: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error occured: ${error.message}`);
    process.exit(1);
  }
};
