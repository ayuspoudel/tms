const { MongoUserRepository } = require("./user.mongo.js");
const { DynamoUserRepository } = require("./user.dynamodb.js");

function userRepo() {
  const dbType = process.env.DB_TYPE || "mongo";

  if (dbType === "dynamo") {
    return new DynamoUserRepository();
  }

  return new MongoUserRepository();
}

module.exports = { userRepo };