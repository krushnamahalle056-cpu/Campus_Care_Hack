import mongoose from "mongoose";

async function connectDB() {
  const connection = await mongoose.connect(process.env.MONGODB_URI);
  console.log(`MongoDB connected: ${connection.connection.name}`);
}

export default connectDB;