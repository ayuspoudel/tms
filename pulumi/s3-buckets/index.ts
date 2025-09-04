import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// Read bucket name from Pulumi config
const config = new pulumi.Config();
const tmsBucketName = config.require("TMS_BUCKET_NAME");

// Create the S3 bucket
const tmsBucket = new aws.s3.Bucket(tmsBucketName, {
    versioning: {
        enabled: true, // Enable versioning
    },
    tags: {
        Name: tmsBucketName,
        Environment: "dev",
        Project: "TMS",
    },
});

// Apply a lifecycle configuration to expire objects after 365 days
new aws.s3.BucketLifecycleConfiguration(`${tmsBucketName}-lifecycle`, {
    bucket: tmsBucket.id,
    rules: [
        {
            id: `${tmsBucketName}-lifecycle-rule`,
            status: "Enabled", // Must be "Enabled"
            filter: {
                prefix: "", // Apply rule to all objects
            },
            expiration: {
                days: 365,
            },
        },
    ],
});

// Export the bucket name
export const bucketNameOutput = tmsBucket.bucket;
