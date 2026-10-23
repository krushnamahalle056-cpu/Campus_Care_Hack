
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();

async function changeAdminPassword() {
  try {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const newPassword = process.env.ADMIN_PASSWORD;

    if (!email || !newPassword) {
      throw new Error("ADMIN_EMAIL or ADMIN_PASSWORD is missing in .env");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    const admin = await User.findOne({ email }).select("+password");

    if (!admin || admin.role !== "ADMIN") {
      throw new Error("Admin not found. Check ADMIN_EMAIL in .env");
    }

    admin.password = await bcrypt.hash(newPassword, 12);
    await admin.save();

    console.log("Admin password changed successfully!");
  } catch (error) {
    console.error("Error:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

changeAdminPassword();
