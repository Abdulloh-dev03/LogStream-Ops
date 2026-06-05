import rateLimit from 'express-rate-limit';

// 1. Safety gate for public log ingestion
export const ingestRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 ingestion requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: 'Too many logs submitted from this source. Please try again later.',
  },
});

// 2. Strict safety gate for Auth routes (Prevents Brute-Force hacking)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login/signup attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
});

export const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // Limit each IP to 100 AI analysis requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many AI analysis requests. Please try again in 1 hour.',
  },
});