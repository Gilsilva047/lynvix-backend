import { z } from 'zod';

export const createBudgetSchema = z.object({
  body: z.object({
    month: z.number().int().min(1).max(12),
    year: z.number().int().min(2020).max(2100),
    categoryId: z.string().uuid(),
    limit: z.number().positive(),
    alertAt70: z.boolean().default(true),
    alertAt90: z.boolean().default(true),
    alertAt100: z.boolean().default(true),
  }),
});

export const updateBudgetSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    limit: z.number().positive().optional(),
    alertAt70: z.boolean().optional(),
    alertAt90: z.boolean().optional(),
    alertAt100: z.boolean().optional(),
  }),
});
