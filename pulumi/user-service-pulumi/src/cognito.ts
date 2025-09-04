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
    schemas: [
        { name: "email", attributeDataType: "String", required: true, mutable: true },
        { name: "name", attributeDataType: "String", required: false, mutable: true },
        { name: "role", attributeDataType: "String", required: false, mutable: true },
    ],
    aliasAttributes: ["email"], // Allow login via email
});

// User Pool Client
export const userPoolClient = new aws.cognito.UserPoolClient("userPoolClient", {
    userPoolId: userPool.id,
    generateSecret: false, // For frontend, secret is usually not needed
    refreshTokenValidity: 30, // 30 days
    accessTokenValidity: 1,   // 1 hour
    idTokenValidity: 1,       // 1 hour
    explicitAuthFlows: [
        "ADMIN_NO_SRP_AUTH",
        "ALLOW_REFRESH_TOKEN_AUTH",
        "ALLOW_USER_PASSWORD_AUTH",
        "ALLOW_ADMIN_USER_PASSWORD_AUTH",
    ],
});