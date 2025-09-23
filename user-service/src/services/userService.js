import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { User } from '../models/User.js';
import { UserRepository, UserSessionRepository } from '../repositories/index.js';
import { BadRequest, NotFound, Unauthorized } from '../utils/errors.js';
import { validateLogin, validateSignup } from '../utils/validation.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';


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
  const safe_user = user.safe();

  const refresh_token = generateRefreshToken(safeUser);
  const access_token = generateAccessToken(safeUser);

  const decoded = jwt.decode(refresh_token);
  await new UserSessionRepository().createSession()({
    userId: safe_user.id,
    refresh_token,
    expiresAt: decoded.exp,
  })

  return {
    user: safe_user,
    access_token,
    refresh_token
  }
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

  const safe_user = user.safe();

  const refresh_token = generateRefreshToken(safeUser);
  const access_token = generateAccessToken(safeUser);

  const decoded = jwt.decode(refreshToken);

  await new UserSessionRepository().createSession({
    userId: safeUser.id,
    refreshToken,
    expiresAt: decoded.exp,
  });

  return {
    user: safe_user,
    access_token,
    refresh_token
  }
}