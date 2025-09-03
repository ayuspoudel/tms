const aws = require('aws-sdk');
const dynamodb = new aws.DynamoDB.DocumentClient();

const tableName = process.env.TABLE_NAME;

module.exports = async (user_id, name, role) => {
    try {
        const updateParams = {
            TableName: tableName,
            Key: { user_id },
            UpdateExpression: "SET #name = :name, #role = :role, updated_at = :updated_at",
            ExpressionAttributeNames: {
                "#name": "name",
                "#role": "role",
            },
            ExpressionAttributeValues: {
                ":name": name,
                ":role": role,
                ":updated_at": new Date().toISOString(),
            },
            ReturnValues: "UPDATED_NEW", // Return updated attributes
        };

        const result = await dynamodb.update(updateParams).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'User profile updated successfully',
                updatedAttributes: result.Attributes,
            }),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to update user profile' }),
        };
    }
};
