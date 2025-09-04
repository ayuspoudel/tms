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
    pathParts: string[],
    method: string
) {
    const resourcePath = pathParts.join("/");
    return new aws.lambda.Permission(`userServiceLambda-invoke-permission-${resourcePath.replace(/\//g, "-")}-${method}`, {
        action: "lambda:InvokeFunction",
        function: lambdaFn.name,
        principal: "apigateway.amazonaws.com",
        sourceArn: pulumi.interpolate`${api.executionArn}/${method}/${resourcePath}`,
    });
}

// Helper to reliably add method/integration/permission for an existing resource
function addMethodAndIntegration(
    resourceId: pulumi.Output<string>,
    pathParts: string[],
    method: string,
    lambda: aws.lambda.Function,
    api: aws.apigateway.RestApi,
    authorizer?: aws.apigateway.Authorizer
) {
    const resourcePath = pathParts.join("-");
    // 1. Integration (must come before Method)
    const integration = new aws.apigateway.Integration(`integration-${resourcePath}-${method}`, {
        restApi: api.id,
        resourceId: resourceId,
        httpMethod: method,
        integrationHttpMethod: "POST",
        type: "AWS_PROXY",
        uri: lambda.invokeArn,
    });
    // 2. Method
    const apigwMethod = new aws.apigateway.Method(`method-${resourcePath}-${method}`, {
        restApi: api.id,
        resourceId: resourceId,
        httpMethod: method,
        authorization: authorizer ? "COGNITO_USER_POOLS" : "NONE",
        authorizerId: authorizer ? authorizer.id : undefined,
        apiKeyRequired: false,
    }, { dependsOn: [integration] }); // PATCH: depend on integration
    // 3. Lambda Permission
    allowApiGatewayInvokePerEndpoint(lambda, api, pathParts, method);
    return apigwMethod;
}

// Root resource ("/")
const rootResourceId = userServiceApi.rootResourceId;

// Public endpoints (no auth)
const authResource = new aws.apigateway.Resource("resource-auth", {
    restApi: userServiceApi.id,
    parentId: rootResourceId,
    pathPart: "auth",
});
const authMethod = addMethodAndIntegration(authResource.id, ["auth"], "POST", userServiceLambda, userServiceApi);

const signupResource = new aws.apigateway.Resource("resource-signup", {
    restApi: userServiceApi.id,
    parentId: rootResourceId,
    pathPart: "signup",
});
const signupMethod = addMethodAndIntegration(signupResource.id, ["signup"], "POST", userServiceLambda, userServiceApi);

// Protected endpoints (require Cognito JWT)
const profileResource = new aws.apigateway.Resource("resource-profile", {
    restApi: userServiceApi.id,
    parentId: rootResourceId,
    pathPart: "profile",
});
const profileMethodGet = addMethodAndIntegration(profileResource.id, ["profile"], "GET", userServiceLambda, userServiceApi, cognitoAuthorizer);
const profileMethodPut = addMethodAndIntegration(profileResource.id, ["profile"], "PUT", userServiceLambda, userServiceApi, cognitoAuthorizer);

const logoutResource = new aws.apigateway.Resource("resource-logout", {
    restApi: userServiceApi.id,
    parentId: rootResourceId,
    pathPart: "logout",
});
const logoutMethod = addMethodAndIntegration(logoutResource.id, ["logout"], "POST", userServiceLambda, userServiceApi, cognitoAuthorizer);

// Gather all methods for deployment dependency
const allMethods = [authMethod, signupMethod, profileMethodGet, profileMethodPut, logoutMethod];

// Deploy the API (create deployment first)
export const deployment = new aws.apigateway.Deployment("userServiceApiDeployment", {
    restApi: userServiceApi.id,
    description: "Deployment for User Service API",
}, { dependsOn: [userServiceLambda, authResource, signupResource, profileResource, logoutResource, ...allMethods] });

// Create a stage referencing the deployment
export const prodStage = new aws.apigateway.Stage("prodStage", {
    restApi: userServiceApi.id,
    deployment: deployment.id,
    stageName: "prod",
    description: "Production stage for User Service API",
});

// The invoke URL for the deployed stage
export const apiEndpoint = pulumi.interpolate`https://${userServiceApi.id}.execute-api.${aws.config.region}.amazonaws.com/${prodStage.stageName}`;