import { signup, login } from "../services/userService.js";
import { success, error } from "../utils/response.js";
import { verifyToken, generateAccessToken } from "../utils/jwt.js";
import { Unauthorized } from "../utils/errors.js";
import { UserSessionRepository } from "../repositories/index.js";

export const handler = async (event) => {
  try {
    const { httpMethod, path, headers, body } = event;
    const normalizedPath = path
      ?.replace(/^\/[^/]+/, "") // strip stage (/dev)
      .replace(/^\/auth/, "")   // strip /auth prefix
      || path;

    if (httpMethod === "POST" && normalizedPath === "/signup") {
      const data = JSON.parse(body);
      return success(await signup(data), 201);
    }

    if (httpMethod === "POST" && normalizedPath === "/login") {
      const data = JSON.parse(body);
      return success(await login(data));
    }

    if (httpMethod === "GET" && normalizedPath === "/me") {
      const authHeader = headers?.Authorization || headers?.authorization;
      if (!authHeader) throw Unauthorized("Missing Authorization header");

      const token = authHeader.split(" ")[1];
      if (!token) throw Unauthorized("Malformed Authorization header");

      const decoded = verifyToken(token);
      return success({ user: decoded });
    }

    if (httpMethod === "POST" && normalizedPath === "/refresh") {
      const data = JSON.parse(body);
      const { refreshToken } = data;
      if (!refreshToken) throw Unauthorized("Refresh token required");

      const sessionRepo = new UserSessionRepository();
      const session = await sessionRepo.findByToken(refreshToken);
      if (!session) throw Unauthorized("Refresh token not valid");

      const decoded = verifyToken(refreshToken);
      const newAccessToken = generateAccessToken({
        id: decoded.id,
        email: decoded.email,
        role: decoded.role || "user",
      });

      return success({ accessToken: newAccessToken });
    }

    if (httpMethod === "POST" && normalizedPath === "/logout") {
      const data = JSON.parse(body);
      const { refreshToken } = data;
      if (!refreshToken) throw Unauthorized("Refresh token required");

      const sessionRepo = new UserSessionRepository();
      await sessionRepo.deleteByToken(refreshToken);

      return success({ message: "Logged out" });
    }

    return error("Not Found", 404);
  } catch (err) {
    return error(err.message || "Internal Server Error", err.statusCode || 500);
  }
};
