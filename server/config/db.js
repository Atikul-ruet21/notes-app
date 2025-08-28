import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("✅ MongoDB Connected");
    } else {
      console.log("⚠️  No MONGO_URI provided");
    }
  } catch (error) {
    console.error("❌ Database connection error:", error.message);
  }
};

export default connectDB;
