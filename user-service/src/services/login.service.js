const bcrypt = require("bcryptjs");
const { getUserRepository } = require("../repositories/user.repository.factory.js");
const { ValidationError } = require("../utils/errors.js");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/jwt.js");
const { UserTokenModel } = require("../models/userToken.mongoose.js");

async function login({ email, password }) {
  const repo = getUserRepository();

  if (!(email && password)) {
    throw new ValidationError("email and password are required.");
  }

  const user = await repo.findByEmail(email);
  if (!user) {
    throw new ValidationError("Invalid email or password.");
  }

  if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
    throw new ValidationError("Account is locked. Try again later.");
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    user.markLoginFailure();
    await repo.update(user.id, user);
    throw new ValidationError("Invalid email or password.");
  }

  user.markLoginSuccess();
  await repo.update(user.id, user);

  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await UserTokenModel.create({
    userId: user.id,
    token: refreshToken,
    type: "REFRESH",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return {
    message: "Login successful",
    accessToken,
    refreshToken,
    user: user.safe(),
  };
}

module.exports = { login };
