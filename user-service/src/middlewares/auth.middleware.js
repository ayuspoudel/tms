const jwt = require("jsonwebtoken");
const { MongoUserRepository } = require("../repositories/user/user.mongo.js");
const { UserTokenModel } = require("../models/userToken.mongoose.js");

const userRepo = new MongoUserRepository();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "accesssecret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refreshsecret";

async function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ message: "Invalid authorization format. Use: Bearer <token>" });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, ACCESS_SECRET);
    const userId = decoded.sub;

    const user = await userRepo.findById(userId);
    if (!user || user.status !== "ACTIVE") {
      return res.status(403).json({ message: "User not active" });
    }

    req.user = user.safe();
    next();
  } catch (err) {
    console.error("JWT access verify error:", err.message);
    return res.status(403).json({ message: "Access token expired or invalid" });
  }
}

async function refreshMiddleware(req, res, next) {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token missing" });
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const userId = decoded.sub;

    const tokenDoc = await UserTokenModel.findOne({ token: refreshToken }).exec();
    if (!tokenDoc) {
      return res.status(403).json({ message: "Refresh token revoked or expired" });
    }

    const user = await userRepo.findById(userId);
    if (!user || user.status !== "ACTIVE") {
      return res.status(403).json({ message: "User not active" });
    }

    req.user = user.safe();
    req.tokenDoc = tokenDoc;
    next();
  } catch (err) {
    console.error("JWT refresh verify error:", err.message);
    return res.status(403).json({ message: "Refresh token expired or invalid" });
  }
}

module.exports = { authMiddleware, refreshMiddleware };
