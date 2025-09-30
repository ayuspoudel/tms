import express from "express";
import dotenv from "dotenv";
import awsRoutes from "./routes/aws.routes.js";
import { checkDynamoConnection } from "./config/db.check.js";
import { checkBootstrapBucket } from "./config/s3.config.js";  

dotenv.config();

const app = express();
app.use(express.json());

// Health check
app.get("/health", async (req, res) => {
  const dynamoOk = await checkDynamoConnection();
  const s3Ok = await checkBootstrapBucket();

  const healthy = dynamoOk && s3Ok;

  res.status(healthy ? 200 : 500).json({
    status: healthy ? "ok" : "error",
    dynamodb: dynamoOk ? "connected" : "unreachable",
    s3Bucket: s3Ok ? "accessible" : "unreachable",
  });
});

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
