import * as aws from "@pulumi/aws";

// DynamoDB Table for User Profiles
export const userProfileTable = new aws.dynamodb.Table("userProfileTable", {
    hashKey: "user_id", // Partition key
    rangeKey: "email",  // Sort key (email is unique for each user)
    attributes: [
        { name: "user_id", type: "S" },
        { name: "email", type: "S" },
        // { name: "role", type: "S" },
        // { name: "name", type: "S" },
        { name: "created_at", type: "S" },
        // { name: "updated_at", type: "S" },
    ],
    billingMode: "PAY_PER_REQUEST", // On-demand pricing
    streamEnabled: true, // Enable streams
    streamViewType: "NEW_AND_OLD_IMAGES",   
    globalSecondaryIndexes: [
        {
            name: "createdAtIndex", // GSI for querying by created_at
            hashKey: "created_at",
            rangeKey: "user_id",
            projectionType: "ALL",
        },
        {
            name: "emailIndex", // GSI for querying by email
            hashKey: "email",
            projectionType: "ALL",
        }
    ],
});

export const tableName = userProfileTable.name;
export const gsiName = "emailIndex";