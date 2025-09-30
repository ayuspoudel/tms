import express from "express";
import dotenv from "dotenv";
import awsRoutes from "./routes/aws.routes.js";
import { checkDynamoConnection } from "./config/db.check.js";
import { checkBootstrapBucket } from "./config/s3.config.js";  

dotenv.config();

const app = express();
app.use(express.json());

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Routes
app.use("/connect/aws", awsRoutes);

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, async () => {
  console.log(`connect-service running on port ${PORT}`);

  // Run DynamoDB check on startup
  await checkDynamoConnection();

  // Run S3 bucket check on startup
  await checkBootstrapBucket();
});
