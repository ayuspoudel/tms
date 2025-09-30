import { Integration } from "../domain/integration.js";
import { getIntegrationRepository } from "../repositories/integration.repository.factory.js";
import {
  CloudFormationClient,
  DescribeStacksCommand,
} from "@aws-sdk/client-cloudformation";
import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";
import { getBootstrapTemplateUrl, s3Config } from "../config/s3.config.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";

const repo = getIntegrationRepository();

// Use centralized config
const TEMPLATE_URL = getBootstrapTemplateUrl();
const STACK_NAME = "TMS-Backend-Bootstrap";

/**
 * Create a new AWS integration
 */
export const createAWSIntegration = async ({ tenantId, accountId, region }) => {
  if (!tenantId || !accountId || !region) {
    throw new Error("Missing required fields: tenantId, accountId, region");
  }

  const integration = new Integration({
    tenantId,
    provider: "aws",
    config: { accountId, region },
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

/**
 * Get CloudFormation Launch URL for tenant to run bootstrap stack
 */
export const getAWSBootstrapLaunchUrl = ({ saasAccountId, saasRoleName }) => {
  return `https://console.aws.amazon.com/cloudformation/home#/stacks/create/review?templateURL=${encodeURIComponent(
    TEMPLATE_URL
  )}&stackName=${STACK_NAME}&SaaSAccountId=${saasAccountId}&SaaSRoleName=${saasRoleName}`;
};

/**
 * Get bootstrap template YAML contents from S3
 */
export const getAWSBootstrapTemplate = async (file = "tms-backend-account-bootstrap.yaml") => {
  const { s3, bucket } = s3Config;
  const command = new GetObjectCommand({ Bucket: bucket, Key: file });
  const response = await s3.send(command);
  return await streamToString(response.Body);
};

const streamToString = async (stream) => {
  return await new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });
};

/**
 * Get bootstrap stack status (self-hosted: no AssumeRole needed)
 */
export const getAWSBootstrapStackStatus = async ({ tenantId, integrationId }) => {
  const integration = await getAWSIntegrationStatus({ tenantId, id: integrationId });
  const { region } = integration.config;

  const cloudFormation = new CloudFormationClient({ region });

  try {
    const { Stacks } = await cloudFormation.send(
      new DescribeStacksCommand({ StackName: STACK_NAME })
    );

    return {
      stackName: STACK_NAME,
      status: Stacks?.[0]?.StackStatus || "UNKNOWN",
      outputs: Stacks?.[0]?.Outputs || [],
    };
  } catch (err) {
    return {
      stackName: STACK_NAME,
      status: "PENDING",
      outputs: [],
      error: err.message,
    };
  }
};
/**
 * Test assuming the backend role for an integration
 */
export const testAssumeBackendRole = async ({ tenantId, integrationId }) => {
  const integration = await getAWSIntegrationStatus({ tenantId, id: integrationId });
  const { accountId, region } = integration.config;

  const roleArn = `arn:aws:iam::${accountId}:role/TMS-BackendRole`;

  const sts = new STSClient({ region });

  const { Credentials, AssumedRoleUser } = await sts.send(
    new AssumeRoleCommand({
      RoleArn: roleArn,
      RoleSessionName: `tms-assume-role-test-${tenantId}`,
      DurationSeconds: 900, // 15 minutes
    })
  );

  return {
    roleArn,
    assumedRoleUser: AssumedRoleUser,
    credentials: {
      accessKeyId: Credentials.AccessKeyId,
      expiration: Credentials.Expiration,
    },
  };
};
