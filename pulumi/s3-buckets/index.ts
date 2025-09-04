import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const config = new pulumi.Config()
// List of bucket names
const tmsBucketName = config.require("TMS_BUCKET_NAME")
const bucketNames = [
    tmsBucketName, 
];
// Create multiple S3 buckets using a loop
const buckets = bucketNames.map(bucketName => {
    // Create the S3 bucket
    const bucket = new aws.s3.Bucket(bucketName, {
        versioning: {
            enabled: true,  // Enable versioning
        },
        tags: {
            Name: bucketName,
            Environment: "dev",
            Project: "TMS",
        },
    });

    // Apply lifecycle configuration to the bucket
    new aws.s3.BucketLifecycleConfiguration(`${bucketName}-lifecycle`, {
        bucket: bucket.id,
        rules: [
            {
                id: `${bucketName}-lifecycle-rule`,  // Add an id for the lifecycle rule
                status: "Enabled",  // Correct usage of status instead of enabled
                filter: {
                    prefix: "", // Apply rule to all objects
                },
                expiration: {
                    days: 365,  // Expire objects after 365 days
                },
            },
        ],
    });

    return bucket;
});

// Export all bucket names
export const bucketNamesOutput = buckets.map(bucket => bucket.bucket);