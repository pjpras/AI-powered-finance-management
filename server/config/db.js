const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("Attempting to connect to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.log("Database connection error:", err.message);
    console.log(
      "Connection string used (partially masked):",
      process.env.MONGO_URI
        ? process.env.MONGO_URI.replace(/:([^:@]+)@/, ":****@")
        : "No connection string found"
    );
    process.exit(1);
  }
};

module.exports = connectDB;
