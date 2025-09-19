const aws = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');   // add uuid for unique usernames
const cognito = new aws.CognitoIdentityServiceProvider();
const dynamodb = new aws.DynamoDB.DocumentClient();

const userPoolId = process.env.USER_POOL_ID;
const tableName = process.env.TABLE_NAME;

module.exports = async (email, password, name, role) => {
    try {
        // Generate a safe, unique Cognito username (not an email)
        const username = `user-${uuidv4()}`;

        const createUserParams = {
            UserPoolId: userPoolId,
            Username: username,
            TemporaryPassword: password,
            UserAttributes: [
                { Name: 'email', Value: email },      // email is stored as an attribute
                { Name: 'name', Value: name },
                { Name: 'custom:role', Value: role }  // custom attribute should be prefixed
            ],  
        };

        const createUserResponse = await cognito.adminCreateUser(createUserParams).promise();

        const putParams = {
            TableName: tableName,
            Item: {
                user_id: createUserResponse.User.Username, // Cognito-generated UUID username
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
                email,
            }),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to create user', error: error.message }),
        };
    }
};
