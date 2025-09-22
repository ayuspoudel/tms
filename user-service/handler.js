import { signup, login } from './services/userService.js';
import { success, error } from './utils/response.js';

export const handler = async (event) => {
  try {
    const { httpMethod, path } = event;

    if (httpMethod === 'POST' && path === '/signup') {
      const body = JSON.parse(event.body);
      return success(await signup(body), 201);
    }

    if (httpMethod === 'POST' && path === '/login') {
      const body = JSON.parse(event.body);
      return success(await login(body));
    }

    return error('Not Found', 404);
  } catch (err) {
    console.error(err);
    return error(err.message || 'Internal Server Error', err.statusCode || 500);
  }
};
