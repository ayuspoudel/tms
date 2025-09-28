const express = require("express");
const {listUsersController, updateUserRoleController, suspendUserController, activateUserController} = require("../controllers/usermgmt.controller");
const {authorize} = require("../middlewares/authorize.middleware");
const { authMiddleware } = require("../middlewares/jwt.middleware.js");
const { activateUser } = require("../services/usermgmt.service.js");

const userMgmtRoutes = express.Router();

userMgmtRoutes.get("/list", authMiddleware, authorize(["OWNER", "ADMIN"]), listUsersController);
userMgmtRoutes.patch("/:id/role", authMiddleware, authorize(["OWNER", "ADMIN"]), updateUserRoleController);
userMgmtRoutes.patch("/:id/suspend", authMiddleware, authorize(["OWNER","ADMIN"]), suspendUserController);
userMgmtRoutes.patch("/:id/activate", authMiddleware, authorize(["OWNER", "ADMIN"]), activateUserController);
module.exports = userMgmtRoutes