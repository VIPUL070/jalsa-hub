import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import type { NextFunction, Request, Response } from "express";
import { User } from '../models/user.js';

declare global {
  namespace Express {
    interface Request {
      user?: InstanceType<typeof User> | null;
    }
  }
}

dotenv.config();

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined in .env");

    try {
        const authHeader = req.headers['authorization'];

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: "Invalid Auth Header"
            });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token as string, JWT_SECRET as string)as jwt.JwtPayload

        req.user = await User.findById(decoded.userId).select('-password');
            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }
            next();

    } catch (error) {
        res.status(500).json({
            message: (error as Error).message
        })
    }
}