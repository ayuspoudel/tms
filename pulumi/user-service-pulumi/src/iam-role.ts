// /src/iamRole.ts
import * as aws from "@pulumi/aws";

// Create IAM role for Lambda function
export function createRole(roleName: string): aws.iam.Role {
    const lambdaRole = new aws.iam.Role(roleName, {
        assumeRolePolicy: JSON.stringify({
            Version: "2012-10-17",
            Statement: [{
                Action: "sts:AssumeRole",
                Principal: { Service: "lambda.amazonaws.com" },
                Effect: "Allow",
                Sid: "",
            }],
        }),
    });

    // Attach the Lambda execution policy by directly referencing the ARN
    new aws.iam.RolePolicyAttachment(`${roleName}-policy-attachment`, {
        role: lambdaRole,
        policyArn: "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole", // Use the ARN directly
    });

    return lambdaRole;
}
