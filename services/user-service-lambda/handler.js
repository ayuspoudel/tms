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
