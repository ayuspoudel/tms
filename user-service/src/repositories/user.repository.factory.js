import { MongoUserRepository } from "./user.mongo.js";
import { DynamoUserRepository } from "./user.dynamo.js";

export function getUserRepository() {
  const dbType = process.env.DB_TYPE || "mongo";

  if (dbType === "dynamo") {
    return new DynamoUserRepository();
  }

  return new MongoUserRepository();
}
