const bcrypt = require("bcryptjs");
const { getUserRepository } = require("../repositories/user.repository.factory.js");
const { ConflictError, ValidationError } = require("../utils/errors.js");

async function ownerExists() {
  repo = getUserRepository();
  const owners = await repo.findByRole("OWNER") || [];
  return owners.length > 0;
}



// async function listUsers()

async function signup(
  { email, password, firstName, lastName, username },
  repo = getUserRepository()
) {
  if (!(email && password && firstName && lastName)) {
    throw new ValidationError("email, password, firstName, lastName are required.");
  }

  const existing = await repo.findByEmail(email);
  if (existing) {
    throw new ConflictError(`User with ${email} already exists`);
  }

  // Check if we need to bootstrap an OWNER
  const isOwner = !(await ownerExists(repo));

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await repo.create({
    email,
    passwordHash,
    firstName,
    lastName,
    username,
    role: isOwner ? "OWNER" : "USER",
    status: "ACTIVE",
    emailVerified: isOwner ? true : false, // OWNER is immediately verified
  });

  return {
    message: isOwner
      ? "Signup successful — you are the OWNER"
      : "Signup successful",
    user: user.safe(),
  };
}

module.exports = { signup, ownerExists };
