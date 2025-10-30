import { z } from 'zod';

export const updateUserSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  avatarUrl: z.string().url().nullable().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const userResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    displayName: z.string(),
    avatarUrl: z.string().nullable(),
    createdAt: z.string(),
  }),
});

export type UserResponse = z.infer<typeof userResponseSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8).max(100),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
