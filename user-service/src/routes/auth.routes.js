const express = require("express");
const {
  signupController,
  findByRoleController,
  loginController,
  refreshController,
  ownerExistsController,
  logoutController,
} = require("../controllers/auth.controller.js");

const { authMiddleware, refreshMiddleware } = require("../middlewares/auth.middleware.js");

const router = express.Router();

// Public routes
router.post("/signup", signupController);
router.get("/owner-exists", ownerExistsController);
router.post("/login", loginController);
router.post("/logout", logoutController);
router.post("/logout/all", logoutController);
// Refresh route with refreshMiddleware
router.post("/refresh", refreshMiddleware, refreshController);

// Protected routes
router.get("/find-by-role", authMiddleware, findByRoleController);
router.get("/profile", authMiddleware, (req, res) => {
  res.json({
    message: "Protected profile data",
    user: req.user,
  });
});

module.exports = router;
