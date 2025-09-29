// src/services/aws.service.js

import { Integration } from "../domain/integration.js";
import { getIntegrationRepository } from "../repositories/integration.repository.factory.js";

const repo = getIntegrationRepository();

/**
 * Create a new AWS integration
 */
export const createAWSIntegration = async ({ tenantId, accountId, roleArn, region }) => {
  if (!tenantId || !accountId || !roleArn || !region) {
    throw new Error("Missing required fields: tenantId, accountId, roleArn, region");
  }

  const integration = new Integration({
    tenantId,
    provider: "aws",
    config: { accountId, roleArn, region },
  });

  return await repo.create(integration);
};

/**
 * List all AWS integrations for a tenant
 */
export const listAWSIntegrations = async (tenantId) => {
  if (!tenantId) throw new Error("tenantId is required");
  return await repo.findByTenant(tenantId);
};

/**
 * Get the status of a specific AWS integration
 */
export const getAWSIntegrationStatus = async ({ tenantId, id }) => {
  if (!tenantId || !id) throw new Error("tenantId and id are required");
  const integration = await repo.findById(tenantId, id);
  if (!integration) throw new Error("Integration not found");
  return integration;
};

/**
 * Delete a specific AWS integration
 */
export const deleteAWSIntegration = async ({ tenantId, id }) => {
  if (!tenantId || !id) throw new Error("tenantId and id are required");
  return await repo.delete(tenantId, id);
};
