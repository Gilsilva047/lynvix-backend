/**
 * Controller do módulo de categorias
 */

import { Request, Response, NextFunction } from 'express';
import categoriesService from './categories.service';

class CategoriesController {
  /**
   * GET /api/v1/categories
   */
  async getAllCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const categories = await categoriesService.getAllCategories(userId);

      return res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/categories/:id
   */
  async getCategoryById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const category = await categoriesService.getCategoryById(userId, id);

      return res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/categories
   */
  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const category = await categoriesService.createCategory(userId, req.body);

      return res.status(201).json({
        success: true,
        message: 'Categoria criada com sucesso',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/categories/:id
   */
  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const category = await categoriesService.updateCategory(userId, id, req.body);

      return res.status(200).json({
        success: true,
        message: 'Categoria atualizada com sucesso',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/categories/:id
   */
  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      await categoriesService.deleteCategory(userId, id);

      return res.status(200).json({
        success: true,
        message: 'Categoria deletada com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CategoriesController();
