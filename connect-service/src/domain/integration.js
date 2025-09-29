// src/domain/integration.js

/**
 * Integration Entity
 * Represents a connected external provider (AWS, GitHub, etc.)
 */
export class Integration {
  constructor({ tenantId, provider, status = "connected", config = {}, id, createdAt, updatedAt }) {
    if (!tenantId) throw new Error("Integration requires tenantId");
    if (!provider) throw new Error("Integration requires provider");

    this.tenantId = tenantId;
    this.provider = provider; // "aws" | "github"
    this.status = status;
    this.config = config;
    this.id = id; 
    this.createdAt = createdAt || new Date().toISOString();
    this.updatedAt = updatedAt || new Date().toISOString();
  }
}
