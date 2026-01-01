/**
 * Validadores do módulo de usuários
 */

import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').optional(),
    cpf: z.string().optional(),
    avatar: z.string().url('Avatar deve ser uma URL válida').optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
    newPassword: z
      .string()
      .min(6, 'Nova senha deve ter no mínimo 6 caracteres')
      .max(100, 'Senha muito longa'),
  }),
});
