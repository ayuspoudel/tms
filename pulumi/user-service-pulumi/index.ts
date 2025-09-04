import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { userPool, userPoolClient } from "./src/cognito";
import { userProfileTable } from "./src/dynamodb";
import { createLambdaRole } from "./src/iam-role";
import { createLambdaFunction, allowApiGatewayInvoke } from "./src/lambda";
import {
    userServiceApi,
    prodStage,
    apiEndpoint,
    deployment,
    cognitoAuthorizer,
} from "./src/api-gateway";
// Read bucket/key from Pulumi config
const config = new pulumi.Config();
const lambdaBucket = config.require("lambdaBucket");
const lambdaKey = config.require("lambdaKey");

// IAM Role for Lambda
const lambdaRole = createLambdaRole(
    "tms-user-service-role",
    userProfileTable.arn,
    userPool.arn
);

// Lambda Function from S3 code (bucket and key from config)
const userLambda = createLambdaFunction(
    "tms-user-service-lambda",
    lambdaRole
);

// Allow API Gateway to invoke Lambda
allowApiGatewayInvoke(userLambda);

// Export Lambda ARN for downstream use
export const lambdaArn = userLambda.arn;

// Export outputs for other stacks/frontend
export const cognitoUserPoolId = userPool.id;
export const cognitoUserPoolClientId = userPoolClient.id;
export const dynamoTableName = userProfileTable.name;
export {
    apiEndpoint,
    prodStage,
    userServiceApi,
    deployment,
    cognitoAuthorizer,
};