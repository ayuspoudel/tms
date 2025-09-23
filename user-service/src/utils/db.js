import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Create low-level client
const dynamoDB = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

// Create high-level DocumentClient wrapper
const dynamo = DynamoDBDocumentClient.from(dynamoDB);

export { dynamo, dynamoDB };
