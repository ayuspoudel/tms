import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import { userPool, userPoolClient } from "./src/auth";

// Export Pool IDs
export const cognitoUserPoolId = userPool.id;
export const cognitoUserPoolClientId = userPoolClient.id;
        