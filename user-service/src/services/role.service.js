const {getUserRepository} = require("../repositories/user.repository.factory")

async function findUserByRole(role, repo = getUserRepository()) {
  if (!role) throw new ValidationError("role is required");

  const users = (await repo.findByRole(role)) || [];
  return users.map((u) => u.safe ? u.safe() : u); // support domain User
}

module.exports = {findUserByRole};