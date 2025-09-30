import { Integration } from "../domain/integration.js";
import { getIntegrationRepository } from "../repositories/integration.repository.factory.js";
import {
  STSClient,
  AssumeRoleCommand,
} from "@aws-sdk/client-sts";
import {
  CloudFormationClient,
  CreateStackCommand,
  UpdateStackCommand,
  DescribeStacksCommand,
} from "@aws-sdk/client-cloudformation";
import { getBootstrapTemplateUrl } from "../config/s3.config.js";

const repo = getIntegrationRepository();

// Use centralized config
const TEMPLATE_URL = getBootstrapTemplateUrl();
const STACK_NAME = "TMS-Backend-Bootstrap";

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

/**
 * Apply the bootstrap CloudFormation stack (create or update)
 */
export const applyAWSBootstrapStack = async ({ tenantId, integrationId }) => {
  const integration = await getAWSIntegrationStatus({ tenantId, id: integrationId });
  const { roleArn, region } = integration.config;

  // AssumeRole
  const sts = new STSClient({ region });
  const { Credentials } = await sts.send(
    new AssumeRoleCommand({
      RoleArn: roleArn,
      RoleSessionName: `tms-bootstrap-${tenantId}`,
    })
  );

  const cf = new CloudFormationClient({
    region,
    credentials: {
      accessKeyId: Credentials.AccessKeyId,
      secretAccessKey: Credentials.SecretAccessKey,
      sessionToken: Credentials.SessionToken,
    },
  });

  try {
    await cf.send(
      new CreateStackCommand({
        StackName: STACK_NAME,
        TemplateURL: TEMPLATE_URL,
        Capabilities: ["CAPABILITY_NAMED_IAM"],
      })
    );
  } catch (err) {
    if (err.name === "AlreadyExistsException") {
      try {
        await cf.send(
          new UpdateStackCommand({
            StackName: STACK_NAME,
            TemplateURL: TEMPLATE_URL,
            Capabilities: ["CAPABILITY_NAMED_IAM"],
          })
        );
      } catch (updateErr) {
        if (
          updateErr.name === "ValidationError" &&
          updateErr.message.includes("No updates")
        ) {
          // benign case
          return { stackName: STACK_NAME, status: "NO_UPDATES" };
        }
        throw updateErr;
      }
    } else {
      throw err;
    }
  }

  return await getAWSBootstrapStackStatus({ cf });
};

/**
 * Get bootstrap stack status (helper for polling)
 */
export const getAWSBootstrapStackStatus = async ({ tenantId, integrationId, cf }) => {
  let cloudFormation = cf;

  if (!cloudFormation) {
    const integration = await getAWSIntegrationStatus({ tenantId, id: integrationId });
    const { roleArn, region } = integration.config;

    const sts = new STSClient({ region });
    const { Credentials } = await sts.send(
      new AssumeRoleCommand({
        RoleArn: roleArn,
        RoleSessionName: `tms-bootstrap-status-${tenantId}`,
      })
    );

    cloudFormation = new CloudFormationClient({
      region,
      credentials: {
        accessKeyId: Credentials.AccessKeyId,
        secretAccessKey: Credentials.SecretAccessKey,
        sessionToken: Credentials.SessionToken,
      },
    });
  }

  const { Stacks } = await cloudFormation.send(
    new DescribeStacksCommand({ StackName: STACK_NAME })
  );

  return {
    stackName: STACK_NAME,
    status: Stacks?.[0]?.StackStatus,
    outputs: Stacks?.[0]?.Outputs || [],
  };
};
