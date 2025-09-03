const aws = require('aws-sdk');
const dynamodb = new aws.DynamoDB.DocumentClient();

const tableName = process.env.TABLE_NAME;

module.exports = async (user_id) => {
    try {
        const getParams = {
            TableName: tableName,
            Key: { user_id },
        };

        const result = await dynamodb.get(getParams).promise();

        if (!result.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'User not found' }),
            };  
        }

        return {
            statusCode: 200,
            body: JSON.stringify(result.Item),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to retrieve user profile' }),
        };
    }
};
