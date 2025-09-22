export function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

export const BadRequest = (msg = 'Bad Request') => httpError(400, msg);
export const Unauthorized = (msg = 'Unauthorized') => httpError(401, msg);
export const NotFound = (msg = 'Not Found') => httpError(404, msg);
export const Conflict = (msg = 'Conflict') => httpError(409, msg);
export const InternalServerError = (msg = 'Internal Server Error') => httpError(500, msg);
