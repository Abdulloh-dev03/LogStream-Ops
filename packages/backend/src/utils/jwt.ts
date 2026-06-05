import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import logger from '../config/logger.js';

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    logger.error('CRITICAL: JWT_SECRET is not defined in environment variables');
    throw new Error('JWT_SECRET is not defined');
  }
  return secret;
};

const getExpiresIn = () => process.env.JWT_EXPIRES_IN || '7d';

export const jwttoken = {
  sign: (payload: string | object | Buffer) => {
    try {
      return jwt.sign(payload, getSecret(), {
        expiresIn: getExpiresIn() as SignOptions['expiresIn'],
      });
    } catch (error) {
      logger.error('Failed to sign token:', error);
      throw new Error('Failed to sign token');
    }
  },
  verify: (token: string) => {
    try {
      return jwt.verify(token, getSecret());
    } catch (error) {
      logger.warn('JWT Verification failed:', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        tokenPreview: token.substring(0, 10) + '...' 
      });
      return null;
    }
  },
};
