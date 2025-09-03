const aws = require('aws-sdk');
const cognito = new aws.CognitoIdentityServiceProvider();
const dynamodb = new aws.DynamoDB.DocumentClient();

const userPoolId = process.env.USER_POOL_ID;
const tableName = process.env.TABLE_NAME;

module.exports = async (email, password, name, role) => {
    try {
        const createUserParams = {
            UserPoolId: userPoolId,
            Username: email,
            TemporaryPassword: password,
            UserAttributes: [
                { Name: 'email', Value: email },
                { Name: 'name', Value: name },
                { Name: 'role', Value: role }
            ],
        };

        const createUserResponse = await cognito.adminCreateUser(createUserParams).promise();

        const putParams = {
            TableName: tableName,
            Item: {
                user_id: createUserResponse.User.Username,
                email,
                name,
                role,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }
        };

        await dynamodb.put(putParams).promise();

        return {
            statusCode: 201,
            body: JSON.stringify({
                message: 'User created successfully',
                userId: createUserResponse.User.Username,
            }),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to create user' }),
        };
    }
};
