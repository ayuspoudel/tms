const {signup} = require("../services/auth.service.js")
const { ownerExists } = require("../services/auth.service.js");
const {findUserByRole} = require("../services/auth.service.js");
const {login} = require("../services/auth.service.js");
const { refresh } = require("../services/auth.service.js");
const { logout } = require("../services/auth.service.js");
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



async function refreshController(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const result = await refresh({ refreshToken });
    res.json(result);
  } catch (err) {
    next(err);
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