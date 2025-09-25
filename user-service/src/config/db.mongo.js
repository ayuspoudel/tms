const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { logger } = require("../utils/logger.js");

dotenv.config();

async function connectDB() {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    logger.error("MONGO_URI is not defined in environment variables");
    process.exit(1);
  }

  try {
    logger.debug(`Attempting MongoDB connection: ${MONGO_URI}`);
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    logger.info("MongoDB Connected");
  } catch (error) {
    logger.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
}

async function disconnectDB() {
  try {
    await mongoose.disconnect();
    logger.info("MongoDB disconnected");
  } catch (err) {
    logger.error("Error disconnecting MongoDB:", err.message);
  }
}

module.exports = { connectDB, disconnectDB };
