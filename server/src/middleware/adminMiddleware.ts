import type { NextFunction, Request, Response } from "express";
import { User } from '../models/user.js';

declare global {
    namespace Express {
        interface Request {
            user?: InstanceType<typeof User> | null;
        }
    }
}

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.user && req.user.role === 'admin') {
            next();
        } else {
            res.status(403).json({ message: 'Not authorized as an admin' });
        }
    } catch (error) {
        res.status(500).json({ 
            message: 'Internal server error in admin verification',
            error: (error as Error).message 
        });
    }
}