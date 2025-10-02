import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('validation:email.invalid'),
  password: z.string().min(6, 'validation:password.minLength'),
});

export const signupSchema = z.object({
  email: z.string().email('validation:email.invalid'),
  password: z.string().min(6, 'validation:password.minLength'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'validation:password.noMatch',
  path: ['confirmPassword'],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
