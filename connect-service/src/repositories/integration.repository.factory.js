// src/repositories/integration.repository.factory.js

import IntegrationDynamoDBRepository from "./integration.dynamodb.js";
import IntegrationRepository from "./_integration.repository.js";

/**
 * Repository Factory
 * Decides which repository implementation to return
 */
export const getIntegrationRepository = () => {
  const backend = process.env.REPO_BACKEND || "DYNAMO";

  switch (backend.toUpperCase()) {
    case "DYNAMO":
      return new IntegrationDynamoDBRepository();
    default:
      throw new Error(`Unknown REPO_BACKEND: ${backend}`);
  }
};
