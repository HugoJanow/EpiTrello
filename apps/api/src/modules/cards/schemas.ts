import { z } from 'zod';
import { CardPriority } from '@epitrello/db';

export const createCardSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  listId: z.string(),
  priority: z.nativeEnum(CardPriority).default(CardPriority.MEDIUM),
  dueDate: z.coerce.date().optional(),
});

export const updateCardSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional().nullable(),
  priority: z.nativeEnum(CardPriority).optional(),
  dueDate: z.coerce.date().optional().nullable(),
});

export const reorderCardSchema = z.object({
  cardId: z.string(),
  listId: z.string(),
  newOrder: z.number(),
});

export const cardMemberSchema = z.object({
  userId: z.string(),
});

export const cardLabelSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9a-f]{6}$/i),
});

export const cardParamsSchema = z.object({
  id: z.string(),
});

export const cardQuerySchema = z.object({
  listId: z.string(),
});

export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
export type ReorderCardInput = z.infer<typeof reorderCardSchema>;
export type CardMemberInput = z.infer<typeof cardMemberSchema>;
export type CardLabelInput = z.infer<typeof cardLabelSchema>;
