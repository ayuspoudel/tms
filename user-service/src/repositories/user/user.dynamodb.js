/**
 * DynamoDB Table: Users
 * - Partition Key: id (String, UUID)
 * - GSI1: EmailIndex
 *   - Partition Key: email (String, unique)
 * - GSI2: NameIndex
 *   - Partition Key: firstName (String)
 *   - Sort Key: lastName (String)
 * - (Optional future) GSI3: RoleIndex
 *   - Partition Key: role (String)
 */

const {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  DeleteItemCommand,
  QueryCommand,
  ScanCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const { User } = require("../../domain/user.js");

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const TABLE = process.env.USER_TABLE || "Users";

class DynamoUserRepository {
  async create(userData) {
    const user = new User(userData);
    await client.send(
      new PutItemCommand({
        TableName: TABLE,
        Item: marshall(user),
      })
    );
    return user;
  }

  async findById(id) {
    const { Item } = await client.send(
      new GetItemCommand({
        TableName: TABLE,
        Key: marshall({ id }),
      })
    );
    return Item ? new User(unmarshall(Item)) : null;
  }

  async findByEmail(email) {
    const { Items } = await client.send(
      new QueryCommand({
        TableName: TABLE,
        IndexName: "EmailIndex",
        KeyConditionExpression: "email = :email",
        ExpressionAttributeValues: {
          ":email": { S: email },
        },
      })
    );
    return Items && Items.length > 0 ? new User(unmarshall(Items[0])) : null;
  }

  async findByName(firstName, lastName) {
    const { Items } = await client.send(
      new QueryCommand({
        TableName: TABLE,
        IndexName: "NameIndex",
        KeyConditionExpression: "firstName = :firstName AND lastName = :lastName",
        ExpressionAttributeValues: {
          ":firstName": { S: firstName },
          ":lastName": { S: lastName },
        },
      })
    );
    return Items ? Items.map((i) => new User(unmarshall(i))) : [];
  }

  async findByRole(role) {
    // If you add a GSI on role, use Query instead of Scan
    const { Items } = await client.send(
      new ScanCommand({
        TableName: TABLE,
        FilterExpression: "#r = :role",
        ExpressionAttributeNames: { "#r": "role" },
        ExpressionAttributeValues: {
          ":role": { S: role },
        },
      })
    );
    return Items ? Items.map((i) => new User(unmarshall(i))) : [];
  }

  async delete(id) {
    await client.send(
      new DeleteItemCommand({
        TableName: TABLE,
        Key: marshall({ id }),
      })
    );
    return true;
  }
}

module.exports = { DynamoUserRepository };
