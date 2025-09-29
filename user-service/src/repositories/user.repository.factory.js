const { MongoUserRepository } = require("./user/user.mongo.js");
const { DynamoUserRepository } = require("./user/user.dynamodb.js");

function getUserRepository() {
  const dbType = process.env.DB_TYPE || "mongo";

  if (dbType === "dynamo") {
    return new DynamoUserRepository();
  }

  return new MongoUserRepository();
}

module.exports = { getUserRepository };