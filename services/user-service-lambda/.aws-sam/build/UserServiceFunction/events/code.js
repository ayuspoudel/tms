const signUp = require('./functions/signUp');
const login = require('./functions/login');
const getUserProfile = require('./functions/getUserProfile');
const updateUserProfile = require('./functions/updateUserProfile');

exports.handler = async (event) => {
    const { httpMethod, path, body, pathParameters } = event;
    const { user_id } = pathParameters || {}; // Get user_id from path if available
    const requestBody = body ? JSON.parse(body) : {};
    const { email, password, name, role } = requestBody;

    switch (httpMethod) {
        case 'POST': // Handle POST requests (Sign-up, Login)
            if (path === '/auth/signup') {
                return await signUp(email, password, name, role);
            } else if (path === '/auth/login') {
                return await login(email, password);
            }
            break;

        case 'GET': // Handle GET requests (Get user profile)
            if (path === `/auth/profile/${user_id}`) {
                return await getUserProfile(user_id);
            }
            break;

        case 'PUT': // Handle PUT requests (Update user profile)
            if (path === `/auth/profile/${user_id}`) {
                return await updateUserProfile(user_id, name, role);
            }
            break;

        default:
            return {
                statusCode: 405,
                body: JSON.stringify({ message: 'Method Not Allowed' }),
            };
    }
};
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
const aws = require('aws-sdk');
const cognito = new aws.CognitoIdentityServiceProvider();

const userPoolId = process.env.USER_POOL_ID;

module.exports = async (email, password) => {
    try {
        const authParams = {
            AuthFlow: 'ADMIN_NO_SRP_AUTH',
            UserPoolId: userPoolId,
            ClientId: process.env.CLIENT_ID,
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password,
            },  
        };

        const authResponse = await cognito.adminInitiateAuth(authParams).promise();

        return { 
            statusCode: 200,  
            body: JSON.stringify({
                accessToken: authResponse.AuthenticationResult.AccessToken,
                idToken: authResponse.AuthenticationResult.IdToken,
                refreshToken: authResponse.AuthenticationResult.RefreshToken,
            }),  
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 401,
            body: JSON.stringify({ message: 'Invalid credentials' }),
        };
    }
};
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
