const { getUserRepository } = require("../repositories/user.repository.factory")
const { ValidationError } = require("../utils/errors");

async function listUsers(){
    const repo = getUserRepository();
    const users = await repo.findAll() || [];
    return users.map((u) => u.safe ? u.safe() : u); 
}

async function updateUserRole(userId, role) {
  const repo = getUserRepository();

  if (!(userId && role)) {
    throw new ValidationError("userId and role are required");
  }

  const user = await repo.update(userId, {
    role,
    updatedAt: new Date().toISOString(),
  });

  if (!user) {
    throw new ValidationError("User not found");
  }

  return user.safe();
}

async function suspendUser(userId){
    const repo = getUserRepository();
    if(!userId){
        throw new ValidationError("userId is required");
    }
    const user = await repo.update(userId, {
        status: "SUSPENDED",
        updatedAt: new Date().toISOString(),
    });
    return user ? user.safe() : null;
}

async function activateUser(userId){
    const repo = getUserRepository();
    if(!userId){
        throw new ValidationError("userId is required");
    }
    const user = await repo.update(userId, {
        status: "ACTIVE",
        updatedAt: new Date().toISOString(),
    });
    return user ? user.safe() : null;
}



module.exports = {listUsers, updateUserRole, suspendUser, activateUser};