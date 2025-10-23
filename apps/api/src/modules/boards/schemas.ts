import { z } from 'zod';

/**
 * Board schemas
 */

export const createBoardSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const updateBoardSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
});

export const boardParamsSchema = z.object({
  id: z.string(),
});

export const boardQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;
export type BoardParams = z.infer<typeof boardParamsSchema>;
export type BoardQuery = z.infer<typeof boardQuerySchema>;

// Response schemas
export const boardSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  ownerId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  owner: z.object({
    id: z.string(),
    email: z.string(),
    displayName: z.string(),
  }),
});

export const boardListSchema = z.object({
  boards: z.array(boardSchema),
  nextCursor: z.string().nullable(),
});

export type Board = z.infer<typeof boardSchema>;
export type BoardList = z.infer<typeof boardListSchema>;
