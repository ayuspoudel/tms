import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

// Helper to create IAM Role for Lambda with DynamoDB and Cognito access
// Accepts Output<string> for ARNs to support Pulumi resource outputs
export function createLambdaRole(
    name: string,
    tableArn: pulumi.Output<string>,
    userPoolArn: pulumi.Output<string>
): aws.iam.Role {
    const role = new aws.iam.Role(name, {
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

    // Attach AWS Lambda basic execution managed policy
    new aws.iam.RolePolicyAttachment(`${name}-basic-execution`, {
        role: role,
        policyArn: "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
    });

    // Inline policy for DynamoDB, Cognito, and SNS permissions
    new aws.iam.RolePolicy(`${name}-app-policy`, {
        role: role.id,
        policy: pulumi.all([tableArn, userPoolArn]).apply(([tArn, uArn]) =>
            JSON.stringify({
                Version: "2012-10-17",
                Statement: [
                    {
                        Effect: "Allow",
                        Action: [
                            "dynamodb:GetItem",
                            "dynamodb:PutItem",
                            "dynamodb:UpdateItem",
                            "dynamodb:Query",
                            "dynamodb:Scan"
                        ],
                        Resource: tArn,
                    },
                    {
                        Effect: "Allow",
                        Action: [
                            "cognito-idp:AdminCreateUser",
                            "cognito-idp:AdminGetUser",
                            "cognito-idp:AdminUpdateUserAttributes",
                            "cognito-idp:AdminInitiateAuth",
                            "cognito-idp:AdminRespondToAuthChallenge"
                        ],
                        Resource: uArn,
                    },
                    {
                        Effect: "Allow",
                        Action: ["sns:Publish"],
                        Resource: "*",
                    },
                ],
            })
        ),
    });

    return role;
}