import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in .env");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Database Connected ✅");
  } catch (error) {
    console.error("Database Connection Error ❌:", error.message);
    process.exit(1); // stop server if DB fails
  }
};

export default connectDB;