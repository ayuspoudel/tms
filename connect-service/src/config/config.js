// src/config/config.js
import dotenv from "dotenv";

dotenv.config(); // loads .env into process.env (for local/dev)

const config = {
  server: {
    port: process.env.PORT || 4000,
  },
  aws: {
    region: process.env.AWS_REGION || "us-east-1",
    endpoint: process.env.DYNAMO_ENDPOINT || "http://localhost:8000",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "fake",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "fake",
    },
  },
  db: {
    tableName: process.env.TABLE_NAME || "Integrations",
  },
};

export default config;
