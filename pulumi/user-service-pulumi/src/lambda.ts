import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { userPool, userPoolClient } from "./cognito";
import { userProfileTable } from "./dynamodb";

// Read bucket and key from Pulumi config (set via pipeline/environment)
const config = new pulumi.Config();
const bucketName = config.require("lambdaBucket"); // S3 bucket name where Lambda zip is uploaded
const objectKey = config.require("lambdaKey");     // S3 object key for Lambda zip

export function createLambdaFunction(
    name: string,
    role: aws.iam.Role
): aws.lambda.Function {
    return new aws.lambda.Function(name, {
        runtime: "nodejs18.x",
        s3Bucket: bucketName,
        s3Key: objectKey,
        handler: "index.handler",
        role: role.arn,
        environment: {
            variables: {
                TABLE_NAME: userProfileTable.name,
                USER_POOL_ID: userPool.id,
                CLIENT_ID: userPoolClient.id,
                EMAIL_GSI_NAME: "emailIndex",
            },
        },
        timeout: 10, // seconds (adjust as needed)
        memorySize: 256, // MB (adjust as needed)
    });
}

// Lambda permission for API Gateway
export function allowApiGatewayInvoke(lambdaFn: aws.lambda.Function, logicalName: string) {
    return new aws.lambda.Permission(`${logicalName}-invoke-permission`, {
        action: "lambda:InvokeFunction",
        function: lambdaFn.name,
        principal: "apigateway.amazonaws.com",
    });
}