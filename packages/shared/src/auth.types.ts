import { z } from 'zod';

// ==========================================
// 1. SIGN UP VALIDATION SCHEMA
// ==========================================
export const SignUpSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  firstname: z.string().min(2, 'Name must be at least 2 characters long.').optional(),
  lastname: z.string().min(2, 'Name must be at least 2 characters long.').optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long.')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
    .regex(/[0-9]/, 'Password must contain at least one number.'),
});

// Infer the TypeScript types from the Zod schemas
export type SignUpInput = z.infer<typeof SignUpSchema>;

// ==========================================
// 2. SIGN IN VALIDATION SCHEMA
// ==========================================
export const SignInSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

export type SignInInput = z.infer<typeof SignInSchema>;

// ==========================================
// 3. AUTHENTICATED USER SESSION RESPONSE TYPE
// ==========================================
export const AuthUserResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    firstname: z.string().optional(),
    lastname: z.string().optional(),
  }),
  token: z.string(),
});


export type AuthUserResponse = z.infer<typeof AuthUserResponseSchema>;


export const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  firstname: z.string().optional(),
  lastname: z.string().optional(),
});

export type User = z.infer<typeof userSchema>;