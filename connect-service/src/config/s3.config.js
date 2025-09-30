import { S3Client, HeadBucketCommand } from "@aws-sdk/client-s3";

const BUCKET_NAME = process.env.S3_BOOTSTRAP_BUCKET || "tms-bootstrap-templates";
const REGION = process.env.S3_REGION || "us-east-1";

// Construct S3 client (using environment/instance creds, not hardcoded keys)
const s3 = new S3Client({ region: REGION });

/**
 * Checks if the bootstrap bucket exists and is accessible.
 */
export const checkBootstrapBucket = async () => {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
    console.log(`S3 bucket "${BUCKET_NAME}" is accessible in ${REGION}`);
    return true;
  } catch (err) {
    console.error(`Failed to access S3 bucket "${BUCKET_NAME}":`, err.message);
    return false;
  }
};

/**
 * Get the public URL of the bootstrap template
 */
export const getBootstrapTemplateUrl = (file = "tms-backend-account-bootstrap.yaml") => {
  return `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${file}`;
};

export const s3Config = {
  s3,
  bucket: BUCKET_NAME,
  region: REGION,
  checkBootstrapBucket,
  getBootstrapTemplateUrl,
};

export default s3Config;
