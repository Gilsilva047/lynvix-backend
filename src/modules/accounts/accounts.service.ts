import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler';

class AccountsService {
  async getAllAccounts(userId: string) {
    return await prisma.bankAccount.findMany({
      where: { userId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async getAccountById(userId: string, accountId: string) {
    const account = await prisma.bankAccount.findFirst({
      where: { id: accountId, userId },
    });
    if (!account) throw new AppError('Conta não encontrada', 404);
    return account;
  }

  async createAccount(userId: string, data: any) {
    return await prisma.bankAccount.create({
      data: { ...data, userId },
    });
  }

  async updateAccount(userId: string, accountId: string, data: any) {
    const account = await this.getAccountById(userId, accountId);
    return await prisma.bankAccount.update({
      where: { id: account.id },
      data,
    });
  }

  async deleteAccount(userId: string, accountId: string) {
    const account = await this.getAccountById(userId, accountId);
    await prisma.bankAccount.delete({ where: { id: account.id } });
  }

  async createTransfer(userId: string, data: any) {
    const { fromAccountId, toAccountId, amount, date, description } = data;

    if (fromAccountId === toAccountId) {
      throw new AppError('Contas de origem e destino devem ser diferentes', 400);
    }

    const [fromAccount] = await Promise.all([
      this.getAccountById(userId, fromAccountId),
      this.getAccountById(userId, toAccountId),
    ]);

    if (Number(fromAccount.balance) < amount) {
      throw new AppError('Saldo insuficiente', 400);
    }

    const transfer = await prisma.$transaction(async (tx) => {
      await tx.bankAccount.update({
        where: { id: fromAccountId },
        data: { balance: { decrement: amount } },
      });

      await tx.bankAccount.update({
        where: { id: toAccountId },
        data: { balance: { increment: amount } },
      });

      return tx.transfer.create({
        data: {
          amount,
          date: new Date(date),
          description,
          fromAccountId,
          toAccountId,
          userId,
        },
        include: {
          fromAccount: true,
          toAccount: true,
        },
      });
    });

    return transfer;
  }
}

export default new AccountsService();
