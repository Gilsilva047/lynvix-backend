import { Request, Response, NextFunction } from 'express';
import budgetsService from './budgets.service';

class BudgetsController {
  async getBudgets(req: Request, res: Response, next: NextFunction) {
    try {
      const month = req.query.month ? parseInt(req.query.month as string) : undefined;
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;
      const budgets = await budgetsService.getBudgets(req.userId!, month, year);
      return res.json({ success: true, data: budgets });
    } catch (error) {
      next(error);
    }
  }

  async getBudgetStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const month = req.query.month ? parseInt(req.query.month as string) : undefined;
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;
      const status = await budgetsService.getBudgetStatus(req.userId!, month, year);
      return res.json({ success: true, data: status });
    } catch (error) {
      next(error);
    }
  }

  async createBudget(req: Request, res: Response, next: NextFunction) {
    try {
      const budget = await budgetsService.createBudget(req.userId!, req.body);
      return res.status(201).json({ success: true, message: 'Orçamento criado', data: budget });
    } catch (error) {
      next(error);
    }
  }

  async updateBudget(req: Request, res: Response, next: NextFunction) {
    try {
      const budget = await budgetsService.updateBudget(req.userId!, req.params.id, req.body);
      return res.json({ success: true, message: 'Orçamento atualizado', data: budget });
    } catch (error) {
      next(error);
    }
  }

  async deleteBudget(req: Request, res: Response, next: NextFunction) {
    try {
      await budgetsService.deleteBudget(req.userId!, req.params.id);
      return res.json({ success: true, message: 'Orçamento deletado' });
    } catch (error) {
      next(error);
    }
  }
}

export default new BudgetsController();
