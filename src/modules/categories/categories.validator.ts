/**
 * Validadores do módulo de categorias
 */

import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
    icon: z.string().optional(),
    color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor deve estar no formato hexadecimal').optional(),
    parentId: z.string().uuid('Parent ID inválido').optional(),
    description: z.string().optional(),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid('ID inválido'),
  }),
  body: z.object({
    name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').optional(),
    icon: z.string().optional(),
    color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor deve estar no formato hexadecimal').optional(),
    parentId: z.string().uuid('Parent ID inválido').optional(),
    description: z.string().optional(),
  }),
});

export const deleteCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid('ID inválido'),
  }),
});
