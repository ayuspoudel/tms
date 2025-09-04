import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { Output } from "@pulumi/pulumi";
import { createLambdaFunction } from "./lambda";
import { createLambdaRole } from "./iam-role";
import { userPool } from "./cognito";
import { userProfileTable } from "./dynamodb";

// Create IAM role for Lambda with required permissions
const lambdaRole = createLambdaRole(
    "userServiceLambdaRole",
    userProfileTable.arn,
    userPool.arn
);

// Create the Lambda function (the code should handle all endpoints)
const userServiceLambda = createLambdaFunction("userServiceLambda", lambdaRole);

// Create REST API Gateway
export const userServiceApi = new aws.apigateway.RestApi("userServiceApi", {
    description: "API Gateway for User Authentication Service (TMS)",
});

// Cognito Authorizer for protected routes
export const cognitoAuthorizer = new aws.apigateway.Authorizer("cognitoAuthorizer", {
    restApi: userServiceApi.id,
    name: "CognitoAuthorizer",
    type: "COGNITO_USER_POOLS",
    identitySource: "method.request.header.Authorization",
    providerArns: [userPool.arn],
});

// Helper to create a unique Lambda permission per endpoint
function allowApiGatewayInvokePerEndpoint(
    lambdaFn: aws.lambda.Function,
    api: aws.apigateway.RestApi,
    pathPart: string,
    method: string
) {
    return new aws.lambda.Permission(`userServiceLambda-invoke-permission-${pathPart}-${method}`, {
        action: "lambda:InvokeFunction",
        function: lambdaFn.name,
        principal: "apigateway.amazonaws.com",
        sourceArn: pulumi.interpolate`${api.executionArn}/${method}/${pathPart}`,
    });
}

// Helper to add method/integration/permission for an existing resource
function addMethodAndIntegration(
    resourceId: pulumi.Output<string>,
    pathPart: string,
    method: string,
    lambda: aws.lambda.Function,
    api: aws.apigateway.RestApi,
    authorizer?: aws.apigateway.Authorizer
) {
    new aws.apigateway.Integration(`integration-${pathPart}-${method}`, {
        restApi: api.id,
        resourceId: resourceId,
        httpMethod: method,
        integrationHttpMethod: "POST",
        type: "AWS_PROXY",
        uri: lambda.invokeArn,
    });

    new aws.apigateway.Method(`method-${pathPart}-${method}`, {
        restApi: api.id,
        resourceId: resourceId,
        httpMethod: method,
        authorization: authorizer ? "COGNITO_USER_POOLS" : "NONE",
        authorizerId: authorizer ? authorizer.id : undefined,
        apiKeyRequired: false,
    });

    allowApiGatewayInvokePerEndpoint(lambda, api, pathPart, method);
}

// Root resource ("/")
const rootResourceId = userServiceApi.rootResourceId;

// Public endpoints (no auth)
const authResource = new aws.apigateway.Resource("resource-auth", {
    restApi: userServiceApi.id,
    parentId: rootResourceId,
    pathPart: "auth",
});
addMethodAndIntegration(authResource.id, "auth", "POST", userServiceLambda, userServiceApi);

const signupResource = new aws.apigateway.Resource("resource-signup", {
    restApi: userServiceApi.id,
    parentId: rootResourceId,
    pathPart: "signup",
});
addMethodAndIntegration(signupResource.id, "signup", "POST", userServiceLambda, userServiceApi);

// Protected endpoints (require Cognito JWT)
// Create /profile resource ONCE
const profileResource = new aws.apigateway.Resource("resource-profile", {
    restApi: userServiceApi.id,
    parentId: rootResourceId,
    pathPart: "profile",
});
addMethodAndIntegration(profileResource.id, "profile", "GET", userServiceLambda, userServiceApi, cognitoAuthorizer);
addMethodAndIntegration(profileResource.id, "profile", "PUT", userServiceLambda, userServiceApi, cognitoAuthorizer);

// /logout
const logoutResource = new aws.apigateway.Resource("resource-logout", {
    restApi: userServiceApi.id,
    parentId: rootResourceId,
    pathPart: "logout",
});
addMethodAndIntegration(logoutResource.id, "logout", "POST", userServiceLambda, userServiceApi, cognitoAuthorizer);

// Deploy the API (create deployment first)
export const deployment = new aws.apigateway.Deployment("userServiceApiDeployment", {
    restApi: userServiceApi.id,
    description: "Deployment for User Service API",
}, { dependsOn: [userServiceLambda] });

// Create a stage referencing the deployment
export const prodStage = new aws.apigateway.Stage("prodStage", {
    restApi: userServiceApi.id,
    deployment: deployment.id,
    stageName: "prod",
    description: "Production stage for User Service API",
});

// The invoke URL for the deployed stage
export const apiEndpoint = pulumi.interpolate`https://${userServiceApi.id}.execute-api.${aws.config.region}.amazonaws.com/${prodStage.stageName}`;