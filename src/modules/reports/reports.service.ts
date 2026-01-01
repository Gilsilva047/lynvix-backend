import prisma from '../../config/database';
import { MonthlySummary, CategoryReport, PaymentMethodReport, EvolutionData } from '../../types';
import { calculatePercentage } from '../../utils/helpers';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

class ReportsService {
  async getMonthlySummary(userId: string, month: number, year: number): Promise<MonthlySummary> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    return this.getMonthlySummaryByDates(userId, startDate, endDate);
  }

  async getMonthlySummaryByDates(userId: string, startDate: Date, endDate: Date): Promise<MonthlySummary> {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
        status: 'PAID',
      },
      include: {
        category: true,
      },
    });

    const totalIncome = transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const balance = totalIncome - totalExpense;

    const categoryTotals = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((acc, t) => {
        const catId = t.category.id;
        const catName = t.category.name;
        if (!acc[catId]) acc[catId] = { id: catId, name: catName, total: 0 };
        acc[catId].total += Number(t.amount);
        return acc;
      }, {} as Record<string, { id: string; name: string; total: number }>);

    const topCategories = Object.values(categoryTotals)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map((cat) => ({
        categoryId: cat.id,
        categoryName: cat.name,
        total: cat.total,
        percentage: calculatePercentage(cat.total, totalExpense),
      }));

    const topExpenses = transactions
      .filter((t) => t.type === 'EXPENSE')
      .sort((a, b) => Number(b.amount) - Number(a.amount))
      .slice(0, 10)
      .map((t) => ({
        id: t.id,
        description: t.description,
        amount: Number(t.amount),
        date: t.date,
        category: t.category.name,
      }));

    // Extrai mês e ano da startDate para manter compatibilidade com a resposta
    const month = startDate.getMonth() + 1;
    const year = startDate.getFullYear();

    return {
      month,
      year,
      totalIncome,
      totalExpense,
      balance,
      topCategories,
      topExpenses,
    };
  }

  async getExpensesByCategory(
    userId: string,
    month: number,
    year: number
  ): Promise<CategoryReport[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    return this.getExpensesByCategoryByDates(userId, startDate, endDate);
  }

  async getExpensesByCategoryByDates(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CategoryReport[]> {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'EXPENSE',
        status: 'PAID',
        date: { gte: startDate, lte: endDate },
      },
      include: {
        category: true,
      },
    });

    const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

    const categoryData = transactions.reduce((acc, t) => {
      const catId = t.category.id;
      if (!acc[catId]) {
        acc[catId] = {
          categoryId: catId,
          categoryName: t.category.name,
          icon: t.category.icon || undefined,
          color: t.category.color || undefined,
          total: 0,
          percentage: 0,
          transactionCount: 0,
        };
      }
      acc[catId].total += Number(t.amount);
      acc[catId].transactionCount += 1;
      return acc;
    }, {} as Record<string, CategoryReport>);

    return Object.values(categoryData)
      .map((cat) => ({
        ...cat,
        percentage: calculatePercentage(cat.total, total),
      }))
      .sort((a, b) => b.total - a.total);
  }

  async getExpensesByPaymentMethod(
    userId: string,
    month: number,
    year: number
  ): Promise<PaymentMethodReport[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    return this.getExpensesByPaymentMethodByDates(userId, startDate, endDate);
  }

  async getExpensesByPaymentMethodByDates(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<PaymentMethodReport[]> {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'EXPENSE',
        status: 'PAID',
        date: { gte: startDate, lte: endDate },
      },
    });

    const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

    const paymentMethodData = transactions.reduce((acc, t) => {
      const method = t.paymentMethod || 'OTHER';
      if (!acc[method]) {
        acc[method] = {
          paymentMethod: method,
          total: 0,
          percentage: 0,
          transactionCount: 0,
        };
      }
      acc[method].total += Number(t.amount);
      acc[method].transactionCount += 1;
      return acc;
    }, {} as Record<string, PaymentMethodReport>);

    return Object.values(paymentMethodData)
      .map((pm) => ({
        ...pm,
        percentage: calculatePercentage(pm.total, total),
      }))
      .sort((a, b) => b.total - a.total);
  }

  async getEvolution(userId: string, months: number = 6): Promise<EvolutionData[]> {
    const data: EvolutionData[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);

      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      const summary = await this.getMonthlySummary(userId, month, year);

      data.push({
        month: format(date, 'MMM/yy', { locale: ptBR }),
        income: summary.totalIncome,
        expense: summary.totalExpense,
        balance: summary.balance,
      });
    }

    return data;
  }
}

export default new ReportsService();
