const { getTokenRepository } = require("../repositories/token.repository.factory.js");
const { verifyRefreshToken } = require("../utils/jwt.js");

async function logout({ refreshToken }) {
  const tokenRepo = getTokenRepository();

  if (!refreshToken) {
    return { message: "No refresh token provided" };
  }

  await tokenRepo.deleteByToken(refreshToken);

  return { message: "Logged out successfully" };
}

async function logoutAll({ refreshToken }) {
  const tokenRepo = getTokenRepository();

  if (!refreshToken) {
    return { message: "No refresh token provided" };
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (err) {
    return { message: "Invalid or expired refresh token" };
  }

  const userId = decoded.sub;

  await tokenRepo.deleteAllByUser(userId);

  return { message: "Logged out successfully from all devices" };
}

module.exports = { logout, logoutAll };
