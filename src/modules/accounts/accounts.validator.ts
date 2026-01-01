import { z } from 'zod';

export const createAccountSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    bank: z.string().min(1),
    accountType: z.enum(['CHECKING', 'SAVINGS', 'INVESTMENT']),
    balance: z.number(),
    color: z.string().optional(),
  }),
});

export const updateAccountSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    name: z.string().min(1).optional(),
    bank: z.string().optional(),
    balance: z.number().optional(),
    color: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const transferSchema = z.object({
  body: z.object({
    fromAccountId: z.string().uuid(),
    toAccountId: z.string().uuid(),
    amount: z.number().positive(),
    date: z.string().datetime(),
    description: z.string().optional(),
  }),
});
