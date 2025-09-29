// src/repositories/integration.dynamodb.js

import { v4 as uuidv4 } from "uuid";
import {
  PutCommand,
  GetCommand,
  QueryCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

import ddbDocClient from "../config/db.dynamo.js";
import IntegrationRepository from "./_integration.repository.js";
import { Integration } from "../domain/integration.js";
import config from "../config/config.js";

const TABLE_NAME = config.db.tableName;

export default class IntegrationDynamoDBRepository extends IntegrationRepository {
  async create(integration) {
    const id = uuidv4();
    const item = {
      ...integration,
      id,
      updatedAt: new Date().toISOString(),
    };

    await ddbDocClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
      })
    );

    return new Integration(item);
  }

  async findByTenant(tenantId) {
    const data = await ddbDocClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "tenantId = :t",
        ExpressionAttributeValues: { ":t": tenantId },
      })
    );

    return (data.Items || []).map((i) => new Integration(i));
  }

  async findById(tenantId, id) {
    const data = await ddbDocClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { tenantId, id },
      })
    );

    return data.Item ? new Integration(data.Item) : null;
  }

  async delete(tenantId, id) {
    await ddbDocClient.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { tenantId, id },
      })
    );

    return { deleted: true, id };
  }
}
