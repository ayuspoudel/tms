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
                USERNAME: email,    // works since email is alias
                PASSWORD: password,
            },  
        };

        const authResponse = await cognito.adminInitiateAuth(authParams).promise();

        return { 
            statusCode: 200,  
            headers: { "Content-Type": "application/json" },
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
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: 'Invalid credentials', error: error.message }),
        };
    }
};
