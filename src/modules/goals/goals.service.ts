import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler';
import { calculateGoalProgress } from '../../utils/helpers';

class GoalsService {
  async getAllGoals(userId: string) {
    const goals = await prisma.goal.findMany({
      where: { userId },
      include: {
        contributions: {
          orderBy: { date: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return goals.map((goal) => ({
      ...goal,
      progress: calculateGoalProgress(Number(goal.currentAmount), Number(goal.targetAmount)),
    }));
  }

  async getGoalById(userId: string, goalId: string) {
    const goal = await prisma.goal.findFirst({
      where: { id: goalId, userId },
      include: {
        contributions: { orderBy: { date: 'desc' } },
      },
    });
    if (!goal) throw new AppError('Meta não encontrada', 404);

    return {
      ...goal,
      progress: calculateGoalProgress(Number(goal.currentAmount), Number(goal.targetAmount)),
    };
  }

  async createGoal(userId: string, data: any) {
    return await prisma.goal.create({
      data: {
        ...data,
        ...(data.deadline && { deadline: new Date(data.deadline) }),
        userId,
      },
    });
  }

  async updateGoal(userId: string, goalId: string, data: any) {
    const goal = await prisma.goal.findFirst({
      where: { id: goalId, userId },
    });
    if (!goal) throw new AppError('Meta não encontrada', 404);

    return await prisma.goal.update({
      where: { id: goalId },
      data: {
        ...data,
        ...(data.deadline && { deadline: new Date(data.deadline) }),
      },
    });
  }

  async deleteGoal(userId: string, goalId: string) {
    const goal = await prisma.goal.findFirst({
      where: { id: goalId, userId },
    });
    if (!goal) throw new AppError('Meta não encontrada', 404);

    await prisma.goal.delete({ where: { id: goalId } });
  }

  async contributeToGoal(userId: string, goalId: string, data: any) {
    const goal = await prisma.goal.findFirst({
      where: { id: goalId, userId },
    });
    if (!goal) throw new AppError('Meta não encontrada', 404);

    const { amount, date, notes } = data;

    const [contribution, updatedGoal] = await prisma.$transaction([
      prisma.goalContribution.create({
        data: {
          goalId,
          amount,
          date: date ? new Date(date) : new Date(),
          notes,
        },
      }),
      prisma.goal.update({
        where: { id: goalId },
        data: {
          currentAmount: { increment: amount },
        },
      }),
    ]);

    const targetAmount = Number(updatedGoal.targetAmount);
    const currentAmount = Number(updatedGoal.currentAmount);

    if (currentAmount >= targetAmount) {
      await prisma.goal.update({
        where: { id: goalId },
        data: { status: 'COMPLETED' },
      });
    }

    return contribution;
  }
}

export default new GoalsService();
