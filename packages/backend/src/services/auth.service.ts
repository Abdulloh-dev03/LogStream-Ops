import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { ConflictError, UnauthorizedError } from '../utils/errors.js';
import logger from '../config/logger.js';
import type { SignUpInput, SignInInput } from '@logstream/shared';

/**
 * Authentication Service
 * Handles user registration and authentication logic via Prisma and bcrypt.
 */
export class AuthService {
  private static readonly SALT_ROUNDS = 12;

  /**
   * Hashes a password and creates a new user record.
   * @throws ConflictError if the email is already in use.
   */
  static async createUser(data: SignUpInput) {
    const { email, password, firstname, lastname } = data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      logger.warn(`Registration attempt failed: Email ${email} already exists.`);
      throw new ConflictError('A user with this email address already exists.');
    }

    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstname: firstname,
        lastname: lastname,
      },
      select: {
        id: true,
        email: true,
        firstname: true,
        lastname: true,
        createdAt: true,
      },
    });

    logger.info(`User registered successfully: ${user.id}`);
    return user;
  }

  /**
   * Validates user credentials and returns the user profile.
   * @throws UnauthorizedError if authentication fails.
   */
  static async authenticateUser(data: SignInInput) {
    const { email, password } = data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      logger.warn(`Login failed: User ${email} not found.`);
      throw new UnauthorizedError('Invalid email or password signature.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Login failed: Incorrect password for ${email}.`);
      throw new UnauthorizedError('Invalid email or password signature.');
    }

    logger.info(`User authenticated: ${user.id}`);
    
    // Return sanitized user object
    return {
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
    };
  }
}
