import * as aws from "@pulumi/aws";

// DynamoDB Table for User Profiles
export const userProfileTable = new aws.dynamodb.Table("userProfileTable", {
    hashKey: "user_id", // Partition key
    rangeKey: "email",  // Sort key
    attributes: [
        { name: "user_id", type: "S" },
        { name: "email", type: "S" },
        { name: "role", type: "S" },
        { name: "name", type: "S" },
        { name: "created_at", type: "S" },
        { name: "updated_at", type: "S" },
    ],
    billingMode: "PAY_PER_REQUEST", // On-demand pricing
    streamEnabled: true, // Enable streams
    streamViewType: "NEW_AND_OLD_IMAGES", // Include both new and old images in the stream
    globalSecondaryIndexes: [
        {
            name: "createdAtIndex", // GSI for querying by created_at
            hashKey: "created_at", // Partition key for the GSI
            rangeKey: "user_id",   // Sort key for the GSI
            projectionType: "ALL", // Project all attributes
        },
    ],
});

export const tableName = userProfileTable.name;
export const gsiName = "createdAtIndex";
