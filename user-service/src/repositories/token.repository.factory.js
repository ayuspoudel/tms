const { MongoTokenRepository } = require("./token/token.mongo.js");
const { DynamoTokenRepository } = require("./token/token.dynamodb.js");

function getTokenRepository() {
  const dbType = process.env.DB_TYPE || "mongo";
  switch (dbType) {
    case "mongo":
      return new MongoTokenRepository();
    case "dynamo":
      return new DynamoTokenRepository();
    default:
      throw new Error(`Unknown DB_TYPE: ${dbType}`);
  }
}

module.exports = { getTokenRepository };