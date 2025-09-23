import { User } from "../models/User.js";
import { dynamo } from "../utils/db.js";
import {
  QueryCommand,
  GetCommand,
  PutCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

const TABLE = process.env.USER_TABLE || "Users";

export class UserRepository {
  async findByEmail(email) {
    const command = new QueryCommand({
      TableName: TABLE,
      IndexName: "email-index",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email.toLowerCase(),
      },
    });

    const res = await dynamo.send(command);
    if (!res.Count || res.Count === 0) return null;
    return new User(res.Items[0]);
  }

  async findById(id) {
    const command = new GetCommand({
      TableName: TABLE,
      Key: { id },
    });

    const res = await dynamo.send(command);
    if (!res.Item) return null;
    return new User(res.Item);
  }

  async createUser(userData) {
    const user = new User(userData);
    user.updatedAt = new Date().toISOString();

    const command = new PutCommand({
      TableName: TABLE,
      Item: user,
    });

    await dynamo.send(command);
    return user;
  }

  async updateUser(id, updates) {
    const existing = await this.findById(id);
    if (!existing) return null;

    Object.assign(existing, updates);
    existing.updatedAt = new Date().toISOString();

    const command = new PutCommand({
      TableName: TABLE,
      Item: existing,
    });

    await dynamo.send(command);
    return existing;
  }

  async deleteUser(id) {
    const command = new DeleteCommand({
      TableName: TABLE,
      Key: { id },
    });

    await dynamo.send(command);
    return true;
  }
}
