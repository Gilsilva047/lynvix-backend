/**
 * Validadores do módulo de transações
 */

import { z } from 'zod';

export const createTransactionSchema = z.object({
  body: z.object({
    description: z.string().min(1, 'Descrição é obrigatória'),
    amount: z.number().positive('Valor deve ser positivo'),
    date: z.string().datetime('Data inválida'),
    type: z.enum(['INCOME', 'EXPENSE'], {
      errorMap: () => ({ message: 'Tipo deve ser INCOME ou EXPENSE' }),
    }),
    status: z.enum(['PAID', 'PENDING', 'SCHEDULED']).default('PAID'),
    paymentMethod: z.enum([
      'CASH',
      'PIX',
      'DEBIT_CARD',
      'CREDIT_CARD',
      'BANK_SLIP',
      'TRANSFER',
      'OTHER',
    ]),
    categoryId: z.string().uuid('Category ID inválido'),
    creditCardId: z.string().uuid('Credit Card ID inválido').optional(),
    bankAccountId: z.string().uuid('Bank Account ID inválido').optional(),
    isRecurring: z.boolean().default(false),
    recurrenceFreq: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).optional(),
    recurrenceEnd: z.string().datetime('Data final de recorrência inválida').optional(),
    installments: z.number().int().min(1).max(48).optional(),
    installmentNum: z.number().int().min(1).optional(),
    notes: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

export const updateTransactionSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID inválido'),
  }),
  body: z.object({
    description: z.string().min(1).optional(),
    amount: z.number().positive().optional(),
    date: z.string().datetime().optional(),
    type: z.enum(['INCOME', 'EXPENSE']).optional(),
    status: z.enum(['PAID', 'PENDING', 'SCHEDULED']).optional(),
    paymentMethod: z
      .enum(['CASH', 'PIX', 'DEBIT_CARD', 'CREDIT_CARD', 'BANK_SLIP', 'TRANSFER', 'OTHER'])
      .optional(),
    categoryId: z.string().uuid().optional(),
    creditCardId: z.string().uuid().optional(),
    bankAccountId: z.string().uuid().optional(),
    notes: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const deleteTransactionSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID inválido'),
  }),
});

export const getTransactionsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    type: z.enum(['INCOME', 'EXPENSE']).optional(),
    status: z.enum(['PAID', 'PENDING', 'SCHEDULED']).optional(),
    categoryId: z.string().uuid().optional(),
    paymentMethod: z
      .enum(['CASH', 'PIX', 'DEBIT_CARD', 'CREDIT_CARD', 'BANK_SLIP', 'TRANSFER', 'OTHER'])
      .optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    search: z.string().optional(),
  }),
});

export const updateTransactionStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID inválido'),
  }),
  body: z.object({
    status: z.enum(['PAID', 'PENDING', 'SCHEDULED'], {
      errorMap: () => ({ message: 'Status deve ser PAID, PENDING ou SCHEDULED' }),
    }),
  }),
});
