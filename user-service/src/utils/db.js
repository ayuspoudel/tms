import AWS from 'aws-sdk';

AWS.config.update({
    region: process.env.AWS_REGION || 'us-east-1',
})

export const dynamo = new AWS.DynamoDB.DocumentClient();

export const dynamoDB = new AWS.DynamoDB();