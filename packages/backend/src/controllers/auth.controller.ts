import { Request, Response, NextFunction } from 'express';
import { SignUpSchema, SignInSchema } from '@logstream/shared';
import { AuthService } from '../services/auth.service.js';
import { jwttoken } from '../utils/jwt.js';
import { cookies } from '../utils/cookies.js';
import { BadRequestError } from '../utils/errors.js';

/**
 * Authentication Controller
 * Manages HTTP-level concerns for authentication (validation, cookies, responses).
 */
export class AuthController {
  /**
   * Register a new user
   */
  static async signUp(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const result = SignUpSchema.safeParse(req.body);

      if (!result.success) {
        throw new BadRequestError(
          'Validation failed: ' + result.error.issues.map((e) => e.message).join(', '),
        );
      }

      const user = await AuthService.createUser(result.data);
      const token = jwttoken.sign({ id: user.id });

      cookies.set(res, 'token', token);

      return res.status(201).json({
        message: 'Registration successful',
        user,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Authenticate a user and set session cookie
   */
  static async signIn(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const result = SignInSchema.safeParse(req.body);

      if (!result.success) {
        throw new BadRequestError(
          'Validation failed: ' + result.error.issues.map((e) => e.message).join(', '),
        );
      }

      const user = await AuthService.authenticateUser(result.data);
      const token = jwttoken.sign({ id: user.id });

      cookies.set(res, 'token', token);

      return res.status(200).json({
        message: 'Login successful',
        user,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Clear the session cookie
   */
  static async signOut(_req: Request, res: Response) {
    cookies.clear(res, 'token');
    return res.status(200).json({ message: 'Signed out successfully' });
  }

  /**
   * Get current user profile
   */
  static async getProfile(req: Request, res: Response) {
    // req.user is populated by authMiddleware
    return res.status(200).json({
      user: req.user,
    });
  }
}
