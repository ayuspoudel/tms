import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

export const awsRegion = config.require("aws:region");
export const lambdaBucket = config.require("lambdaBucket");
export const lambdaKey = config.require("lambdaKey");
