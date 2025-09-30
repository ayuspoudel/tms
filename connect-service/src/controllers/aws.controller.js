import {
  createAWSIntegration,
  listAWSIntegrations,
  getAWSIntegrationStatus,
  deleteAWSIntegration,
  getAWSBootstrapLaunchUrl,
  getAWSBootstrapTemplate,
  getAWSBootstrapStackStatus,
  testAssumeBackendRole,
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

/**
 * GET /connect/aws/bootstrap/link?saasAccountId=xxx&saasRoleName=xxx
 */
export const getAWSBootstrapLink = async (req, res) => {
  try {
    const { saasAccountId, saasRoleName } = req.query;
    if (!saasAccountId || !saasRoleName) {
      return res.status(400).json({ error: "saasAccountId and saasRoleName are required" });
    }
    const link = getAWSBootstrapLaunchUrl({ saasAccountId, saasRoleName });
    res.json({ launchUrl: link });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /connect/aws/bootstrap/template
 */
export const getAWSBootstrapTemplateCtrl = async (req, res) => {
  try {
    const content = await getAWSBootstrapTemplate();
    res.type("text/yaml").send(content);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /connect/aws/:id/bootstrap/status?tenantId=xxx
 */
export const getAWSBootstrapStatus = async (req, res) => {
  try {
    const { tenantId } = req.query;
    const { id } = req.params;
    const result = await getAWSBootstrapStackStatus({ tenantId, integrationId: id });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /connect/aws/:id/assume?tenantId=xxx
 * Try to assume the TMS-BackendRole for this integration
 */
export const assumeAWSRole = async (req, res) => {
  try {
    const { tenantId } = req.query;
    const { id } = req.params;
    const result = await testAssumeBackendRole({ tenantId, integrationId: id });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};