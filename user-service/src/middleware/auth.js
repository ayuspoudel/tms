import { verifyToken } from "../utils/jwt";
import { Unauthorized } from "../utils/errors";
export function authMiddleware(req, res, next){
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        throw Unauthorized('Missing auth header');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        throw Unauthorized('Invalid auth header');
    }
    
    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (err){
        throw Unauthorized('Invalid or expired token')
    }
}