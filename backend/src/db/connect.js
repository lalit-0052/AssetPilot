
import mongoose from "mongoose";

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.warn("MONGO_URI not set. AssetFlow API will use seed data for local demos.");
    return null;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected:", conn.connection.host);
    return conn;
  } catch (error) {
    console.error("MongoDB connection FAILED", error);
    process.exit(1);
  }
};

export default connectDB;