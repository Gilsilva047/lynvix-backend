/**
 * Rotas do módulo de categorias
 */

import { Router } from 'express';
import categoriesController from './categories.controller';
import { authenticate } from '../../middlewares/auth';
import { validate } from '../../middlewares/validation';
import {
  createCategorySchema,
  updateCategorySchema,
  deleteCategorySchema,
} from './categories.validator';

const router = Router();

// Todas as rotas exigem autenticação
router.use(authenticate);

// GET /api/v1/categories
router.get('/', categoriesController.getAllCategories);

// GET /api/v1/categories/:id
router.get('/:id', categoriesController.getCategoryById);

// POST /api/v1/categories
router.post('/', validate(createCategorySchema), categoriesController.createCategory);

// PUT /api/v1/categories/:id
router.put('/:id', validate(updateCategorySchema), categoriesController.updateCategory);

// DELETE /api/v1/categories/:id
router.delete('/:id', validate(deleteCategorySchema), categoriesController.deleteCategory);

export default router;
