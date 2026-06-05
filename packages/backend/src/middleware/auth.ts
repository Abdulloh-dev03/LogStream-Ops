import { Request, Response, NextFunction } from 'express';
import { cookies } from '../utils/cookies.js';
import { jwttoken } from '../utils/jwt.js';
import { prisma } from '../lib/prisma.js';
import logger from '../config/logger.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        firstname: string | null;
        lastname: string | null;
        createdAt: Date;
      };
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // 1. Extract token (Priority: Cookie > Authorization Header)
    // Check both req.cookies and req.signedCookies for robustness
    let token = cookies.get(req, "token") || req.signedCookies?.["token"];

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      logger.warn(`Access denied: No token provided for path ${req.path}`);
      res.status(401).json({
        message: "Authentication required",
        error: "NO_TOKEN",
      });
      return;
    }

    // 2. Verify token payload
    const decoded = jwttoken.verify(token) as { id: string } | null;

    if (!decoded || !decoded.id) {
      logger.warn(`Access denied: Invalid or expired token for path ${req.path}`);
      res.status(401).json({
        message: "Invalid or expired session. Please sign in again.",
        error: "INVALID_TOKEN",
      });
      return;
    }

    // 3. Retrieve user from data-store (and exclude password)
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        firstname: true,
        lastname:true,
        createdAt: true,
      },
    });

    if (!user) {
      logger.warn(`Access denied: User ${decoded.id} not found in database`);
      res.status(401).json({
        message: "Your account could not be found.",
        error: "USER_NOT_FOUND",
      });
      return;
    }

    // 4. Attach user data to the request object
    req.user = user as any;
    next();
  } catch (error) {
    logger.error("Authentication internal error:", error);
    res.status(401).json({
      message: "An internal authentication error occurred.",
      error: "AUTH_INTERNAL_ERROR",
    });
  }
};
