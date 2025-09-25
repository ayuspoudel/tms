const {signup} = require("../services/auth.service.js")

async function signupController(req, res, next){
    try{
        const result = await signup(req.body);
        res.status(201).json(result)
    } catch(err){
        next(err);
    }
}

module.exports = { signupController };