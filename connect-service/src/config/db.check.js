// src/config/db.check.js

import { ListTablesCommand } from "@aws-sdk/client-dynamodb";
import ddbDocClient from "./db.dynamo.js";
import config from "./config.js";

export const checkDynamoConnection = async () => {
  try {
    const data = await ddbDocClient.send(new ListTablesCommand({}));
    const tables = data.TableNames || [];

    if (tables.includes(config.db.tableName)) {
      console.log(`Connected to DynamoDB. Found table: ${config.db.tableName}`);
      return true;
    } else {
      console.warn(` Connected to DynamoDB, but table "${config.db.tableName}" not found.`);
      console.log("Tables from Dynamo:", tables);
      console.log("Expected table:", config.db.tableName);
      console.log("Connecting to Dynamo at:", config.aws.endpoint);


      return false;
    }
  } catch (err) {
    console.error(" Failed to connect to DynamoDB:", err.message);
    return false;
  }
};
