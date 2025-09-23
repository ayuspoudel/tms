import jwt from 'jsonwebtoken';
import config from '../config/index.js'

export function generateAccessToken(user){
    const user_details = {
        id: user.id,
        email: user.email,
        role: user.role || 'user'
    }
    const expire = {expiresIn: config.jwt.expiresIn};

    return jwt.sign(user_details, config.jwt.secret, expire);
}

export function generateRefreshToken(user){
    const user_details = {id: user.id};
    const expire = config.jwt.refreshExpiresIn

    return jwt.sign(user_details, config.jwt.secret, expire);
}

export function verifyToken(token){
    return jwt.verify(token, config.jwt.secret);
}