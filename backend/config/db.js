import mongoose from "mongoose";
import Role from "../models/Role.js";

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
        console.log(`Role ${role.name} with permissions: ${role.permissions} created.`);
      }
    }
  } catch (error) {
    console.error(`Error while creating roles: ${error.message}`);
  }
}

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_DB_URI);
    await initializeRoles();
    console.log(`Connected to mongo database: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error occured: ${error.message}`);
    process.exit(1);
  }
};
