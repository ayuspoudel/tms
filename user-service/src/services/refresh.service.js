const { ValidationError } = require("../utils/errors.js");
const {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/jwt.js");
const { getTokenRepository } = require("../repositories/token.repository.factory.js");

async function refresh({ refreshToken }) {
  if (!refreshToken) {
    throw new ValidationError("Refresh token required");
  }

  const tokenRepo = getTokenRepository();

  const stored = await tokenRepo.findByToken(refreshToken);
  if (!stored) {
    throw new ValidationError("Invalid refresh token");
  }

  const decoded = verifyRefreshToken(refreshToken);

  await tokenRepo.deleteByToken(refreshToken);

  const payload = {
    sub: decoded.sub,
    email: decoded.email,
    role: decoded.role,
  };

  const newAccessToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken(payload);

  // 5. Save new refresh token
  await tokenRepo.create({
    userId: decoded.sub,
    token: newRefreshToken,
    type: "REFRESH",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });

  // 6. Return both
  return {
    message: "Token refreshed",
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

module.exports = { refresh };
