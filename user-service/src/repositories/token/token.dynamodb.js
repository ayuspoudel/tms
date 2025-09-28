// {
//   "TableName": "UserTokens",
//   "KeySchema": [
//     { "AttributeName": "token", "KeyType": "HASH" }
//   ],
//   "AttributeDefinitions": [
//     { "AttributeName": "token", "AttributeType": "S" },
//     { "AttributeName": "userId", "AttributeType": "S" }
//   ],
//   "GlobalSecondaryIndexes": [
//     {
//       "IndexName": "userId-index",
//       "KeySchema": [
//         { "AttributeName": "userId", "KeyType": "HASH" }
//       ],
//       "Projection": { "ProjectionType": "ALL" }
//     }
//   ],
//   "BillingMode": "PAY_PER_REQUEST",
//   "TimeToLiveSpecification": {
//     "Enabled": true,
//     "AttributeName": "expiresAt"
//   }
// }


const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, GetCommand, DeleteCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");

class DynamoTokenRepository {
  constructor() {
    this.client = DynamoDBDocumentClient.from(new DynamoDBClient({
      region: process.env.AWS_REGION || "us-east-1",
    }));

    this.tableName = process.env.DYNAMO_TOKENS_TABLE || "UserTokens";
  }

  /**
   * Save a new token
   */
  async create(tokenData) {
    const item = {
      userId: tokenData.userId,
      token: tokenData.token,
      type: tokenData.type || "REFRESH",
      expiresAt: tokenData.expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
    };

    await this.client.send(new PutCommand({
      TableName: this.tableName,
      Item: item,
    }));

    return item;
  }

  /**
   * Find token by value
   */
  async findByToken(token) {
    const result = await this.client.send(new GetCommand({
      TableName: this.tableName,
      Key: { token },
    }));
    return result.Item || null;
  }

  /**
   * Delete token by value
   */
  async deleteByToken(token) {
    await this.client.send(new DeleteCommand({
      TableName: this.tableName,
      Key: { token },
    }));
    return true;
  }

  /**
   * Delete all tokens for a given user
   */
  async deleteAllByUser(userId) {
    // This assumes you have a GSI on userId
    const result = await this.client.send(new QueryCommand({
      TableName: this.tableName,
      IndexName: "userId-index", // must be created in Dynamo
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: {
        ":uid": userId,
      },
    }));

    if (!result.Items) return;

    for (const item of result.Items) {
      await this.deleteByToken(item.token);
    }
  }
}

module.exports = { DynamoTokenRepository };
