const { UserTokenModel } = require("../models/userToken.mongoose.js");
const { ValidationError } = require("../utils/errors.js");
const {
  verifyRefreshToken,
  generateAccessToken,
} = require("../utils/jwt.js");

async function refresh({ refreshToken }) {
  if (!refreshToken) {
    throw new ValidationError("Refresh token required");
  }

  const stored = await UserTokenModel.findOne({ token: refreshToken, type: "REFRESH" }).exec();
  if (!stored) {
    throw new ValidationError("Invalid refresh token");
  }

  const decoded = verifyRefreshToken(refreshToken);

  const newAccessToken = generateAccessToken({
    sub: decoded.sub,
    email: decoded.email,
    role: decoded.role,
  });

  return {
    message: "Token refreshed",
    accessToken: newAccessToken,
  };
}

module.exports = { refresh };
