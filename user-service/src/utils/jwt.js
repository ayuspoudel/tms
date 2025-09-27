const jwt = require("jsonwebtoken");

// Environment configs
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "accesssecret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refreshsecret";

const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_TTL || "15m";   // short-lived
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_TTL || "7d"; // long-lived

// Generate Access Token
function generateAccessToken(payload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
}

// Generate Refresh Token
function generateRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
}

// Verify Access Token
function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

// Verify Refresh Token
function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
