const express = require("express");
const {
  signupController,
  findByRoleController,
  loginController,
  refreshController,
  ownerExistsController,
  logoutController,
} = require("../controllers/auth.controller.js");
const {authorize} = require("../middlewares/authorize.middleware.js")

const { authMiddleware, refreshMiddleware } = require("../middlewares/jwt.middleware.js");

const authrouter = express.Router();

// Public routes
authrouter.post("/signup", signupController);
authrouter.get("/owner-exists", authMiddleware, authorize(["OWNER", "ADMIN"]), ownerExistsController);
authrouter.post("/login", loginController);
authrouter.post("/logout", logoutController);
authrouter.post("/logout/all", logoutController);
// Refresh route with refreshMiddleware
authrouter.post("/refresh", refreshMiddleware, refreshController);

// Protected routes
authrouter.get("/find-by-role", authMiddleware, findByRoleController);
authrouter.get("/profile", authMiddleware, (req, res) => {
  res.json({
    message: "Protected profile data",
    user: req.user,
  });
});

module.exports = authrouter;
