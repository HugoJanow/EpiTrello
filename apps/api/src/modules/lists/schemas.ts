import { z } from 'zod';

export const createListSchema = z.object({
  title: z.string().min(1).max(100),
  boardId: z.string(),
});

export const updateListSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  order: z.number().optional(),
});

export const reorderListSchema = z.object({
  boardId: z.string(),
  listId: z.string(),
  newOrder: z.number(),
});

export const listParamsSchema = z.object({
  id: z.string(),
});

export const listQuerySchema = z.object({
  boardId: z.string(),
});

export type CreateListInput = z.infer<typeof createListSchema>;
export type UpdateListInput = z.infer<typeof updateListSchema>;
export type ReorderListInput = z.infer<typeof reorderListSchema>;
