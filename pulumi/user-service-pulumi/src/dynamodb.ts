import * as aws from "@pulumi/aws";

// Create DynamoDB table for storing users
const usersTable = new aws.dynamodb.Table("Users", {
  hashKey: "user_id",   // Partition key (user_id)
  rangeKey: "email",    // Sort key (email)
  billingMode: "PAY_PER_REQUEST", // On-demand capacity mode
  attributes: [
    { name: "user_id", type: "S" },   // String type for user_id
    { name: "email", type: "S" },      // String type for email (indexed)
    { name: "role", type: "S" },       // String type for role (Admin/User/Manager)
    { name: "password_hash", type: "S" },  // Store hashed password
    { name: "created_at", type: "S" }, // Timestamp for when the user was created
    { name: "last_login", type: "S" }, // Timestamp for last login
  ],
  globalSecondaryIndexes: [
    {
      name: "EmailIndex",  // Secondary index on email for fast lookup
      hashKey: "email",  // Using email as the partition key for the secondary index
      projection: {
        projectionType: "ALL",  // Return all attributes in the index
      },
    },
  ],
});

// Export the table name and ARN for future use
export const usersTableName = usersTable.name;
export const usersTableArn = usersTable.arn;
  