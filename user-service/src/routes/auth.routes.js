const express = require("express");
const { signupController, findByRoleController, loginController, refreshController } = require("../controllers/auth.controller.js");
const { ownerExistsController } = require("../controllers/auth.controller.js");

const router = express.Router();

router.post("/signup", signupController);
router.get("/owner-exists", ownerExistsController);
router.get("/find-by-role", findByRoleController);
router.post("/login", loginController);
router.post("/refresh", refreshController);
module.exports = router;
