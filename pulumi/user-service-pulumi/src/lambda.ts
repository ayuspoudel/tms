// /src/lambda.ts
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

// Create Lambda function
export function createLambdaFunction(
    name: string,
    role: aws.iam.Role
): aws.lambda.Function {
    return new aws.lambda.Function(name, {
        runtime: "nodejs14.x", 
        code: new pulumi.asset.FileArchive("./user-service.zip"), // Path to Lambda function code 
        handler: "index.handler", // Lambda entry point
        role: role.arn, // IAM role for the Lambda function
    });
}
