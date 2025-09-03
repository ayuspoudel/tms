// /src/auth.ts
import * as aws from "@pulumi/aws";

// Cognito User Pool
export const userPool = new aws.cognito.UserPool("userPool", {
    autoVerifiedAttributes: ["email"],
    mfaConfiguration: "OFF",
    emailVerificationSubject: "Verify your email",
    emailVerificationMessage: "Your verification code is {####}",
    passwordPolicy: {
        minimumLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: true,
    },
});

// User Pool Client
export const userPoolClient = new aws.cognito.UserPoolClient("userPoolClient", {
    userPoolId: userPool.id,
    generateSecret: true,
    refreshTokenValidity: 30,
    accessTokenValidity: 1,
    idTokenValidity: 1,
});
