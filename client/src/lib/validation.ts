import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Enter your email address.')
    .email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
})

export const signupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Enter your full name.')
      .max(60, 'Name must be 60 characters or fewer.'),
    email: z
      .string()
      .trim()
      .min(1, 'Enter your email address.')
      .email('Enter a valid email address.'),
    password: z
      .string()
      .min(8, 'Use at least 8 characters.')
      .max(72, 'Password must be 72 characters or fewer.')
      .regex(/[A-Za-z]/, 'Include at least one letter.')
      .regex(/\d/, 'Include at least one number.'),
    confirmPassword: z.string().min(1, 'Confirm your password.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

export const raiseTicketSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, 'Give the ticket a short title.')
    .max(120, 'Title must be 120 characters or fewer.'),
  description: z
    .string()
    .trim()
    .min(10, 'Describe the issue in at least 10 characters.')
    .max(4000, 'Description must be 4000 characters or fewer.'),
  categoryId: z.string().min(1, 'Pick a category.'),
})

export type LoginValues = z.infer<typeof loginSchema>
export type SignupValues = z.infer<typeof signupSchema>
export type RaiseTicketValues = z.infer<typeof raiseTicketSchema>
