
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();

async function seedAdmin() {
  try {
    const { MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD, JWT_SECRET } =
      process.env;

    if (!MONGODB_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD || !JWT_SECRET) {
      throw new Error("Required .env values are missing.");
    }

    if (JWT_SECRET.length < 32 || ADMIN_PASSWORD.length < 12) {
      throw new Error(
        "Use a JWT secret of at least 32 characters and admin password of at least 12 characters."
      );
    }

    await mongoose.connect(MONGODB_URI);

    const email = ADMIN_EMAIL.trim().toLowerCase();
    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      if (existingAdmin.role !== "ADMIN") {
        throw new Error(
          "Configured admin email belongs to a non-admin user. Choose a different ADMIN_EMAIL."
        );
      }

      console.log("Admin account already exists. No changes made.");
      return;
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    await User.create({
      name: "CampusCare Admin",
      email,
      password: hashedPassword,
      role: "ADMIN",
    });

    console.log("Admin account created successfully.");
    console.log(`Admin email: ${email}`);
    console.log("Keep the admin password private.");
  } catch (error) {
    console.error("Admin setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedAdmin();
