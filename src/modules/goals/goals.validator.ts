import { z } from 'zod';

export const createGoalSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    targetAmount: z.number().positive(),
    currentAmount: z.number().min(0).default(0),
    deadline: z.string().datetime().optional(),
    icon: z.string().optional(),
    color: z.string().optional(),
  }),
});

export const updateGoalSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    targetAmount: z.number().positive().optional(),
    currentAmount: z.number().min(0).optional(),
    deadline: z.string().datetime().optional(),
    status: z.enum(['IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
    icon: z.string().optional(),
    color: z.string().optional(),
  }),
});

export const contributeGoalSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    amount: z.number().positive(),
    date: z.string().datetime().optional(),
    notes: z.string().optional(),
  }),
});
