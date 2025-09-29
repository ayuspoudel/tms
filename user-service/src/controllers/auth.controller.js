const {signup} = require("../services/auth.service.js")
const { ownerExists } = require("../services/auth.service.js");
const {findUserByRole} = require("../services/auth.service.js");
const {login} = require("../services/auth.service.js");
const { refresh } = require("../services/auth.service.js");
const { logout, logoutAll } = require("../services/auth.service.js");

async function findByRoleController(req, res, next){
    try{
        const {role} = req.query;
        const users = await findUserByRole(role);
        res.json({count: users.length, users})
    }
    catch(error){
        next(error);
    }
}
async function ownerExistsController(req, res, next) {
  try {
    const exists = await ownerExists();
    res.json({ ownerExists: exists });
  } catch (err) {
    next(err);
  }
}

async function loginController(req,res, next){
    try{
        const {email, password} = req.body;
        const result = await login({email, password});
        res.json(result);
    } catch(error){
        next(error);
    }
}

async function refreshController(req, res) {
  const { refreshToken } = req.body;
  console.debug("[refreshController] Received refreshToken:", refreshToken);

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    console.debug("[refreshController] Refresh token valid for:", decoded.email);

    const newAccessToken = generateAccessToken({
      sub: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    });

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error("[refreshController] Error verifying refresh token:", err.message);
    return res.status(401).json({ message: "Invalid refresh token" });
  }
}


async function signupController(req, res, next){
    try{
        const result = await signup(req.body);
        res.status(201).json(result)
    } catch(err){
        next(err); 
    }
}

async function logoutController(req, res, next){
    try{
        const result = await logout(req.body); 
        res.json(result);}
    catch (error){
        next(error);
    }
}

async function logoutAllController(req, res, next){
    try{
        const result = await logoutAll(req.body);
        res.join(result);

    }
    catch (error){
        next(error);;
    }
}

module.exports = { signupController, ownerExistsController, findByRoleController, loginController, refreshController, logoutController, logoutAllController};