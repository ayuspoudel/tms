import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { User } from '../models/User.js';
import { UserRepository } from '../repositories/index.js';
import { BadRequest, NotFound, Unauthorized } from '../utils/errors.js';
import { validateLogin, validateSignup } from '../utils/validation.js';

export async function signup(data) {
  console.log()
  await validateSignup(data);

  const existing = await UserRepository.findByEmail(data.email);
  if (existing) {
    throw BadRequest('Email already exists');
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = new User({
    id: uuid(),
    firstName: data.firstName,
    lastName: data.lastName,
    dob: data.dob,
    email: data.email,
    passwordHash,
    team: data.team,
    provider: 'local',
  });

  await UserRepository.createUser(user);
  return user.safe();
}

export async function login({ email, password }) {
  await validateLogin({ email, password });

  const user = await UserRepository.findByEmail(email);
  if (!user) {
    throw NotFound('User not found. Please sign up before login');
  }

  const valid = await user.verifyPassword(password);
  if (!valid) {
    throw Unauthorized('Invalid credentials');
  }

  return user.safe();
}