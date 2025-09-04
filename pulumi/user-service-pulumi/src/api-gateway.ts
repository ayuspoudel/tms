import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { userPool } from "./cognito";
import { userProfileTable } from "./dynamodb";

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

// Helper: create Method first, then Integration (Integration depends on Method)
function addMethodAndIntegration(
    resourceId: pulumi.Output<string>,
    pathParts: string[],
    method: string,
    lambda: aws.lambda.Function,
    api: aws.apigateway.RestApi,
    authorizer?: aws.apigateway.Authorizer
) {
    const resourcePath = pathParts.join("-");
    // 1. Create Method FIRST
    const apigwMethod = new aws.apigateway.Method(`method-${resourcePath}-${method}`, {
        restApi: api.id,
        resourceId: resourceId,
        httpMethod: method,
        authorization: authorizer ? "COGNITO_USER_POOLS" : "NONE",
        authorizerId: authorizer ? authorizer.id : undefined,
        apiKeyRequired: false,
    });
    // 2. Integration DEPENDS ON Method
    const integration = new aws.apigateway.Integration(`integration-${resourcePath}-${method}`, {
        restApi: api.id,
        resourceId: resourceId,
        httpMethod: method,
        integrationHttpMethod: "POST",
        type: "AWS_PROXY",
        uri: lambda.invokeArn,
    }, { dependsOn: [apigwMethod] });
    // 3. Lambda Permission (can be parallel)
    allowApiGatewayInvokePerEndpoint(lambda, api, pathParts, method);
    return { method: apigwMethod, integration };
}

// PATCH: main setup function - pass userLambda in here
export function setupApiGatewayEndpoints(userLambda: aws.lambda.Function) {
    // Root resource ("/")
    const rootResourceId = userServiceApi.rootResourceId;

    // Public endpoints (no auth)
    const authResource = new aws.apigateway.Resource("resource-auth", {
        restApi: userServiceApi.id,
        parentId: rootResourceId,
        pathPart: "auth",
    });
    const auth = addMethodAndIntegration(authResource.id, ["auth"], "POST", userLambda, userServiceApi);

    const signupResource = new aws.apigateway.Resource("resource-signup", {
        restApi: userServiceApi.id,
        parentId: rootResourceId,
        pathPart: "signup",
    });
    const signup = addMethodAndIntegration(signupResource.id, ["signup"], "POST", userLambda, userServiceApi);

    // Protected endpoints (require Cognito JWT)
    const profileResource = new aws.apigateway.Resource("resource-profile", {
        restApi: userServiceApi.id,
        parentId: rootResourceId,
        pathPart: "profile",
    });
    const profileGet = addMethodAndIntegration(profileResource.id, ["profile"], "GET", userLambda, userServiceApi, cognitoAuthorizer);
    const profilePut = addMethodAndIntegration(profileResource.id, ["profile"], "PUT", userLambda, userServiceApi, cognitoAuthorizer);

    const logoutResource = new aws.apigateway.Resource("resource-logout", {
        restApi: userServiceApi.id,
        parentId: rootResourceId,
        pathPart: "logout",
    });
    const logout = addMethodAndIntegration(logoutResource.id, ["logout"], "POST", userLambda, userServiceApi, cognitoAuthorizer);

    // Gather all methods/integrations for deployment dependency
    const allMethodObjs = [auth, signup, profileGet, profilePut, logout];
    const allMethods = allMethodObjs.map(m => m.method);
    const allIntegrations = allMethodObjs.map(m => m.integration);

    // Deploy the API (create deployment first)
    const deployment = new aws.apigateway.Deployment("userServiceApiDeployment", {
        restApi: userServiceApi.id,
        description: "Deployment for User Service API",
    }, { dependsOn: [authResource, signupResource, profileResource, logoutResource, ...allMethods, ...allIntegrations] });

    // Create a stage referencing the deployment
    const prodStage = new aws.apigateway.Stage("prodStage", {
        restApi: userServiceApi.id,
        deployment: deployment.id,
        stageName: "prod",
        description: "Production stage for User Service API",
    });

    // The invoke URL for the deployed stage
    const apiEndpoint = pulumi.interpolate`https://${userServiceApi.id}.execute-api.${aws.config.region}.amazonaws.com/${prodStage.stageName}`;

    // Export resources for external use
    return {
        deployment,
        prodStage,
        apiEndpoint,
        userServiceApi,
        cognitoAuthorizer,
    };
}