import { dynamo } from "../utils/db.js";
import { v4 as uuid } from "uuid";
import {
  PutCommand,
  QueryCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = process.env.USER_SESSIONS_TABLE || "UserSessions";

export class UserSessionRepository {
  async createSession({ userId, refreshToken, expiresAt }) {
    const session = {
      id: uuid(),
      userId,
      refreshToken,
      expiresAt,
      createdAt: new Date().toISOString(),
    };

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: session, // capital I in v3
    });

    await dynamo.send(command);
    return session;
  }

  async findBySession(refreshToken) {
    const command = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "refreshToken-index",
      KeyConditionExpression: "refreshToken = :rt",
      ExpressionAttributeValues: {
        ":rt": refreshToken,
      },
    });

    const res = await dynamo.send(command);
    if (!res.Count || res.Count === 0) return null;
    return res.Items[0];
  }

  async deleteByToken(refreshToken) {
    const session = await this.findBySession(refreshToken);
    if (!session) return null;

    const command = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id: session.id },
    });

    await dynamo.send(command);
    return session;
  }

  async deleteByUser(userId) {
    const queryCommand = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "userId-index",
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: {
        ":uid": userId,
      },
    });

    const res = await dynamo.send(queryCommand);
    if (!res.Count || res.Count === 0) return;

    for (const session of res.Items) {
      const deleteCommand = new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { id: session.id },
      });
      await dynamo.send(deleteCommand);
    }
  }
}
