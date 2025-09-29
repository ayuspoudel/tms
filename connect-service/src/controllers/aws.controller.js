// src/controllers/aws.controller.js

import {
  createAWSIntegration,
  listAWSIntegrations,
  getAWSIntegrationStatus,
  deleteAWSIntegration,
} from "../services/aws.service.js";

/**
 * POST /connect/aws/connect
 */
export const connectAWS = async (req, res) => {
  try {
    const { tenantId, accountId, roleArn, region } = req.body;
    const integration = await createAWSIntegration({ tenantId, accountId, roleArn, region });
    res.status(201).json(integration);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * GET /connect/aws?tenantId=xxx
 */
export const listAWS = async (req, res) => {
  try {
    const { tenantId } = req.query;
    const integrations = await listAWSIntegrations(tenantId);
    res.json(integrations);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * GET /connect/aws/:id/status?tenantId=xxx
 */
export const statusAWS = async (req, res) => {
  try {
    const { tenantId } = req.query;
    const { id } = req.params;
    const integration = await getAWSIntegrationStatus({ tenantId, id });
    res.json(integration);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

/**
 * DELETE /connect/aws/:id?tenantId=xxx
 */
export const deleteAWS = async (req, res) => {
  try {
    const { tenantId } = req.query;
    const { id } = req.params;
    const result = await deleteAWSIntegration({ tenantId, id });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
