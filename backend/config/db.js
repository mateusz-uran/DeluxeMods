import mongoose from "mongoose";
import Role from "../models/Role.js";
import ModSpecification from "../models/ModSpecification.js";

async function initializeRoles() {
  const roles = [
    { name: "ADMIN", permissions: ["ADD_USER", "READ_USERS", "UPDATE_USER"] },
    { name: "EDITOR", permissions: ["ACCEPT_REVIEW"] },
    { name: "REVIEWER", permissions: ["ADD_REVIEW"] },
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
      }
    }
  } catch (error) {
    console.error(`Error while creating roles: ${error.message}`);
  }
}

async function initializeModCategories() {
  const categories = [
    { name: "Tractors", subCategory: ["Small", "Medium", "Big"] },
    { name: "Harvesters", subCategory: ["Combine", "Forage"] },
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
  ];

  try {
    for (const category of categories) {
      const existingCategory = await ModSpecification.findOne({
        name: category.name,
      });
      if (!existingCategory) {
        await new ModSpecification({
          name: category.name,
          subCategory: category.subCategory,
        }).save();
        console.log(
          `Category ${category.name} with subcategories: ${category.subCategory} created.`
        );
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
