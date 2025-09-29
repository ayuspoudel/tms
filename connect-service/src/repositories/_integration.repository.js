// src/repositories/_integration.repository.js

/**
 * IntegrationRepository (interface)
 * Defines the persistence contract for integrations.
 * 
 * Implementations:
 *  - integration.dynamodb.js
 *  - integration.inmemory.js
 */
export default class IntegrationRepository {
  /**
   * Create a new integration
   * @param {Integration} integration
   * @returns {Promise<Integration>}
   */
  async create(integration) {
    throw new Error("Not implemented");
  }

  /**
   * List all integrations for a tenant
   * @param {string} tenantId
   * @returns {Promise<Integration[]>}
   */
  async findByTenant(tenantId) {
    throw new Error("Not implemented");
  }

  /**
   * Get a specific integration by tenant + id
   * @param {string} tenantId
   * @param {string} id
   * @returns {Promise<Integration|null>}
   */
  async findById(tenantId, id) {
    throw new Error("Not implemented");
  }

  /**
   * Delete a specific integration
   * @param {string} tenantId
   * @param {string} id
   * @returns {Promise<{deleted: boolean, id: string}>}
   */
  async delete(tenantId, id) {
    throw new Error("Not implemented");
  }
}
