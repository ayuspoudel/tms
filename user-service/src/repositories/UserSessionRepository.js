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

    await dynamo.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: session, // must be "Item" in v3
      })
    );

    return session;
  }

  async findBySession(refreshToken) {
    const res = await dynamo.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: "refreshToken-index",
        KeyConditionExpression: "refreshToken = :rt",
        ExpressionAttributeValues: { ":rt": refreshToken },
      })
    );

    if (!res.Count || res.Count === 0) return null;
    return res.Items[0];
  }

  async deleteByToken(refreshToken) {
    const session = await this.findBySession(refreshToken);
    if (!session) return null;

    await dynamo.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { id: session.id },
      })
    );

    return session;
  }

  async deleteByUser(userId) {
    const res = await dynamo.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: "userId-index",
        KeyConditionExpression: "userId = :uid",
        ExpressionAttributeValues: { ":uid": userId },
      })
    );

    if (!res.Count || res.Count === 0) return;

    for (const session of res.Items) {
      await dynamo.send(
        new DeleteCommand({
          TableName: TABLE_NAME,
          Key: { id: session.id },
        })
      );
    }
  }
}
