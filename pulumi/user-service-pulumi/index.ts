import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { userPool, userPoolClient } from "./src/cognito";
import { userProfileTable } from "./src/dynamodb";
import { createLambdaRole } from "./src/iam-role";
import { createLambdaFunction, allowApiGatewayInvoke } from "./src/lambda";
import { setupApiGatewayEndpoints } from "./src/api-gateway";

const config = new pulumi.Config();
const lambdaBucket = config.require("lambdaBucket");
const lambdaKey = config.require("lambdaKey");

// IAM Role for Lambda
const lambdaRole = createLambdaRole(
    "tms-user-service-role",
    userProfileTable.arn,
    userPool.arn
);

// Create Lambda ONCE (use your own createLambdaFunction implementation!)
const userLambda = createLambdaFunction(
    "tms-user-service-lambda",
    lambdaRole
    // Optionally pass in code, bucket/key, etc.
);

// Setup API Gateway endpoints using the SINGLE Lambda
const {
    deployment,
    prodStage,
    apiEndpoint,
    userServiceApi,
    cognitoAuthorizer,
} = setupApiGatewayEndpoints(userLambda);

// Allow API Gateway to invoke Lambda (if needed for extra permissions)
allowApiGatewayInvoke(userLambda, "userServiceLambda-main");

// Export Lambda ARN for downstream use
export const lambdaArn = userLambda.arn;
export const cognitoUserPoolId = userPool.id;
export const cognitoUserPoolClientId = userPoolClient.id;
export const dynamoTableName = userProfileTable.name;

// Export API Gateway outputs for frontend or other stacks
export {
    apiEndpoint,
    prodStage,
    userServiceApi,
    deployment,
    cognitoAuthorizer,
};