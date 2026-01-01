import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler';

class CardsService {
  async getAllCards(userId: string) {
    return await prisma.creditCard.findMany({
      where: { userId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async getCardById(userId: string, cardId: string) {
    const card = await prisma.creditCard.findFirst({
      where: { id: cardId, userId },
    });
    if (!card) throw new AppError('Cartão não encontrado', 404);
    return card;
  }

  async createCard(userId: string, data: any) {
    return await prisma.creditCard.create({
      data: { ...data, userId },
    });
  }

  async updateCard(userId: string, cardId: string, data: any) {
    const card = await this.getCardById(userId, cardId);
    return await prisma.creditCard.update({
      where: { id: card.id },
      data,
    });
  }

  async deleteCard(userId: string, cardId: string) {
    const card = await this.getCardById(userId, cardId);
    await prisma.creditCard.delete({ where: { id: card.id } });
  }

  async getCardInvoice(userId: string, cardId: string, month: number, year: number) {
    const card = await this.getCardById(userId, cardId);

    const startDate = new Date(year, month - 1, card.closingDay - 30);
    const endDate = new Date(year, month - 1, card.closingDay);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        creditCardId: cardId,
        date: { gte: startDate, lte: endDate },
      },
      include: { category: true },
    });

    const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      card: { id: card.id, name: card.name },
      month,
      year,
      total,
      dueDate: new Date(year, month - 1, card.dueDay),
      closingDate: endDate,
      transactions,
    };
  }
}

export default new CardsService();
