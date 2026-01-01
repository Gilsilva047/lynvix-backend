import { z } from 'zod';

export const createCardSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    lastDigits: z.string().length(4, 'Últimos dígitos devem ter 4 caracteres'),
    limit: z.number().positive('Limite deve ser positivo'),
    closingDay: z.number().int().min(1).max(31),
    dueDay: z.number().int().min(1).max(31),
    brand: z.string().optional(),
    color: z.string().optional(),
  }),
});

export const updateCardSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    name: z.string().min(1).optional(),
    limit: z.number().positive().optional(),
    closingDay: z.number().int().min(1).max(31).optional(),
    dueDay: z.number().int().min(1).max(31).optional(),
    brand: z.string().optional(),
    color: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});
