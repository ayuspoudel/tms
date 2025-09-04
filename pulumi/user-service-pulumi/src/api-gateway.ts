import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { Output } from "@pulumi/pulumi";
import { createLambdaFunction, allowApiGatewayInvoke } from "./lambda";
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

// Allow API Gateway to invoke Lambda
allowApiGatewayInvoke(userServiceLambda);

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

// Helper to create an API Gateway resource and method
function addEndpoint(
    parentId: pulumi.Output<string>,
    pathPart: string,
    method: string,
    lambda: aws.lambda.Function,
    authorizer?: aws.apigateway.Authorizer
) {
    const resource = new aws.apigateway.Resource(`resource-${pathPart}-${method}`, {
        restApi: userServiceApi.id,
        parentId: parentId,
        pathPart: pathPart,
    });

    new aws.apigateway.Integration(`integration-${pathPart}-${method}`, {
        restApi: userServiceApi.id,
        resourceId: resource.id,
        httpMethod: method,
        integrationHttpMethod: "POST",
        type: "AWS_PROXY",
        uri: lambda.invokeArn,
    });

    const methodOpts: aws.apigateway.MethodArgs = {
        restApi: userServiceApi.id,
        resourceId: resource.id,
        httpMethod: method,
        authorization: authorizer ? "COGNITO_USER_POOLS" : "NONE",
        authorizerId: authorizer ? authorizer.id : undefined,
        apiKeyRequired: false,
    };

    new aws.apigateway.Method(`method-${pathPart}-${method}`, methodOpts);
    return resource;
}

// Root resource ("/")
const rootResourceId = userServiceApi.rootResourceId;

// Public endpoints (no auth)
addEndpoint(rootResourceId, "auth", "POST", userServiceLambda); // /auth (might use for routing in Lambda)
addEndpoint(rootResourceId, "signup", "POST", userServiceLambda); // /signup

// Protected endpoints (require Cognito JWT)
addEndpoint(rootResourceId, "profile", "GET", userServiceLambda, cognitoAuthorizer); // /profile
addEndpoint(rootResourceId, "profile", "PUT", userServiceLambda, cognitoAuthorizer); // /profile
addEndpoint(rootResourceId, "logout", "POST", userServiceLambda, cognitoAuthorizer); // /logout

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