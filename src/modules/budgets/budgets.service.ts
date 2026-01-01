import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler';
import { calculatePercentage } from '../../utils/helpers';
import { BudgetStatus } from '../../types';

class BudgetsService {
  async getBudgets(userId: string, month?: number, year?: number) {
    const now = new Date();
    const targetMonth = month || now.getMonth() + 1;
    const targetYear = year || now.getFullYear();

    return await prisma.budget.findMany({
      where: { userId, month: targetMonth, year: targetYear },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
      },
    });
  }

  async getBudgetStatus(userId: string, month?: number, year?: number): Promise<BudgetStatus[]> {
    const budgets = await this.getBudgets(userId, month, year);

    return budgets.map((budget) => {
      const limit = Number(budget.limit);
      const spent = Number(budget.spent);
      const remaining = limit - spent;
      const percentage = calculatePercentage(spent, limit);

      let alert: 'none' | 'warning' | 'danger' | 'exceeded' = 'none';
      if (percentage >= 100) alert = 'exceeded';
      else if (percentage >= 90) alert = 'danger';
      else if (percentage >= 70) alert = 'warning';

      return {
        categoryId: budget.category.id,
        categoryName: budget.category.name,
        limit,
        spent,
        remaining,
        percentage,
        alert,
      };
    });
  }

  async createBudget(userId: string, data: any) {
    const { month, year, categoryId, limit, alertAt70, alertAt90, alertAt100 } = data;

    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        OR: [{ userId }, { isDefault: true }],
      },
    });
    if (!category) throw new AppError('Categoria não encontrada', 404);

    const existing = await prisma.budget.findFirst({
      where: { userId, categoryId, month, year },
    });
    if (existing) throw new AppError('Orçamento já existe para esta categoria neste mês', 409);

    return await prisma.budget.create({
      data: {
        userId,
        categoryId,
        month,
        year,
        limit,
        alertAt70,
        alertAt90,
        alertAt100,
        spent: 0,
      },
      include: {
        category: true,
      },
    });
  }

  async updateBudget(userId: string, budgetId: string, data: any) {
    const budget = await prisma.budget.findFirst({
      where: { id: budgetId, userId },
    });
    if (!budget) throw new AppError('Orçamento não encontrado', 404);

    return await prisma.budget.update({
      where: { id: budgetId },
      data,
      include: {
        category: true,
      },
    });
  }

  async deleteBudget(userId: string, budgetId: string) {
    const budget = await prisma.budget.findFirst({
      where: { id: budgetId, userId },
    });
    if (!budget) throw new AppError('Orçamento não encontrado', 404);

    await prisma.budget.delete({ where: { id: budgetId } });
  }
}

export default new BudgetsService();
