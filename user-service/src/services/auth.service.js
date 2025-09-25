const bcrypt = require("bcryptjs");
const { getUserRepository } = require("../repositories/user.repository.factory.js");
const { ConflictError, ValidationError } = require("../utils/errors.js");

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

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await repo.create({
    email,
    passwordHash,
    firstName,
    lastName,
    username,
  });

  return { message: "Signup successful", user: user.safe() };
}

module.exports = { signup };