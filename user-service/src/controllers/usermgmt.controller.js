const {listUsers, updateUserRole, suspendUser, activateUser} = require("../services/usermgmt.service");

async function listUsersController(req, res, next) {
  try {
    const users = await listUsers();
    res.json({ count: users.length, users });
  } catch (err) {
    next(err);
  }
}

async function updateUserRoleController(req, res, next){
    try{
        const {id} = req.params;
        const {role} = req.body;
        const user = await updateUserRole(id, role);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    }
    catch(err){
        next(err);
    }
}

async function suspendUserController(req, res, next){
    try{
        const {id} = req.params;
        const user = await suspendUser(id);
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        res.json(user);
    }
    catch (err){
        next(err);
    }
}

async function activateUserController(req, res, next){
    try{
        const {id} = req.params;
        const user = await activateUser(id);
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        res.json(user)
    } catch(err){
        next(err);
    }
}

module.exports = {listUsersController, updateUserRoleController, suspendUserController, activateUserController}

