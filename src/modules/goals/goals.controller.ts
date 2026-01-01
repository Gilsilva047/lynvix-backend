import { Request, Response, NextFunction } from 'express';
import goalsService from './goals.service';

class GoalsController {
  async getAllGoals(req: Request, res: Response, next: NextFunction) {
    try {
      const goals = await goalsService.getAllGoals(req.userId!);
      return res.json({ success: true, data: goals });
    } catch (error) {
      next(error);
    }
  }

  async getGoalById(req: Request, res: Response, next: NextFunction) {
    try {
      const goal = await goalsService.getGoalById(req.userId!, req.params.id);
      return res.json({ success: true, data: goal });
    } catch (error) {
      next(error);
    }
  }

  async createGoal(req: Request, res: Response, next: NextFunction) {
    try {
      const goal = await goalsService.createGoal(req.userId!, req.body);
      return res.status(201).json({ success: true, message: 'Meta criada', data: goal });
    } catch (error) {
      next(error);
    }
  }

  async updateGoal(req: Request, res: Response, next: NextFunction) {
    try {
      const goal = await goalsService.updateGoal(req.userId!, req.params.id, req.body);
      return res.json({ success: true, message: 'Meta atualizada', data: goal });
    } catch (error) {
      next(error);
    }
  }

  async deleteGoal(req: Request, res: Response, next: NextFunction) {
    try {
      await goalsService.deleteGoal(req.userId!, req.params.id);
      return res.json({ success: true, message: 'Meta deletada' });
    } catch (error) {
      next(error);
    }
  }

  async contributeToGoal(req: Request, res: Response, next: NextFunction) {
    try {
      const contribution = await goalsService.contributeToGoal(
        req.userId!,
        req.params.id,
        req.body
      );
      return res.status(201).json({
        success: true,
        message: 'Contribuição adicionada',
        data: contribution,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new GoalsController();
