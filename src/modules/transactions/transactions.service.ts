/**
 * Service do módulo de transações
 */

import prisma from '../../config/database';
import { AppError } from '../../middlewares/errorHandler';
import { TransactionFilters, PaginatedResponse } from '../../types';
import { Prisma, Transaction, PaymentMethod, RecurrenceFrequency } from '@prisma/client';

interface CreateTransactionData {
  description: string;
  amount: number;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  status: 'PAID' | 'PENDING' | 'SCHEDULED';
  paymentMethod: PaymentMethod;
  categoryId: string;
  creditCardId?: string;
  bankAccountId?: string;
  isRecurring: boolean;
  recurrenceFreq?: RecurrenceFrequency;
  recurrenceEnd?: string;
  installments?: number;
  installmentNum?: number;
  notes?: string;
  tags: string[];
}

interface UpdateTransactionData {
  description?: string;
  amount?: number;
  date?: string;
  type?: 'INCOME' | 'EXPENSE';
  status?: 'PAID' | 'PENDING' | 'SCHEDULED';
  paymentMethod?: PaymentMethod;
  categoryId?: string;
  creditCardId?: string;
  bankAccountId?: string;
  notes?: string;
  tags?: string[];
}

class TransactionsService {
  /**
   * Lista todas as transações com filtros e paginação
   */
  async getAllTransactions(
    userId: string,
    filters: TransactionFilters
  ): Promise<PaginatedResponse<Transaction>> {
    const {
      page = 1,
      limit = 20,
      type,
      status,
      categoryId,
      paymentMethod,
      startDate,
      endDate,
      search,
    } = filters;

    const skip = (page - 1) * limit;

    // Monta o filtro do Prisma
    const where: Prisma.TransactionWhereInput = {
      userId,
      ...(type && { type }),
      ...(status && { status }),
      ...(categoryId && { categoryId }),
      ...(paymentMethod && { paymentMethod: paymentMethod as PaymentMethod }),
      ...(startDate &&
        endDate && {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
      ...(search && {
        OR: [
          { description: { contains: search, mode: 'insensitive' } },
          { notes: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    // Busca as transações
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
              color: true,
            },
          },
          creditCard: {
            select: {
              id: true,
              name: true,
              lastDigits: true,
            },
          },
          bankAccount: {
            select: {
              id: true,
              name: true,
              bank: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      success: true,
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Busca uma transação por ID
   */
  async getTransactionById(userId: string, transactionId: string) {
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
      },
      include: {
        category: true,
        creditCard: true,
        bankAccount: true,
      },
    });

    if (!transaction) {
      throw new AppError('Transação não encontrada', 404);
    }

    return transaction;
  }

  /**
   * Cria uma nova transação
   */
  async createTransaction(userId: string, data: CreateTransactionData) {
    // Verifica se a categoria existe e pertence ao usuário
    const category = await prisma.category.findFirst({
      where: {
        id: data.categoryId,
        OR: [{ userId }, { isDefault: true }],
      },
    });

    if (!category) {
      throw new AppError('Categoria não encontrada', 404);
    }

    // Se tem creditCardId, verifica se pertence ao usuário
    if (data.creditCardId) {
      const creditCard = await prisma.creditCard.findFirst({
        where: {
          id: data.creditCardId,
          userId,
        },
      });

      if (!creditCard) {
        throw new AppError('Cartão de crédito não encontrado', 404);
      }
    }

    // Se tem bankAccountId, verifica se pertence ao usuário
    if (data.bankAccountId) {
      const bankAccount = await prisma.bankAccount.findFirst({
        where: {
          id: data.bankAccountId,
          userId,
        },
      });

      if (!bankAccount) {
        throw new AppError('Conta bancária não encontrada', 404);
      }
    }

    // Cria a transação
    const transaction = await prisma.transaction.create({
      data: {
        ...data,
        date: new Date(data.date),
        recurrenceEnd: data.recurrenceEnd ? new Date(data.recurrenceEnd) : null,
        userId,
      },
      include: {
        category: true,
        creditCard: true,
        bankAccount: true,
      },
    });

    return transaction;
  }

  /**
   * Atualiza uma transação
   */
  async updateTransaction(userId: string, transactionId: string, data: UpdateTransactionData) {
    // Verifica se a transação existe e pertence ao usuário
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
      },
    });

    if (!transaction) {
      throw new AppError('Transação não encontrada', 404);
    }

    // Se está alterando a categoria, verifica se existe
    if (data.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: data.categoryId,
          OR: [{ userId }, { isDefault: true }],
        },
      });

      if (!category) {
        throw new AppError('Categoria não encontrada', 404);
      }
    }

    // Atualiza a transação
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        ...data,
        ...(data.date && { date: new Date(data.date) }),
      },
      include: {
        category: true,
        creditCard: true,
        bankAccount: true,
      },
    });

    return updatedTransaction;
  }

  /**
   * Deleta uma transação
   */
  async deleteTransaction(userId: string, transactionId: string) {
    // Verifica se a transação existe e pertence ao usuário
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
      },
    });

    if (!transaction) {
      throw new AppError('Transação não encontrada', 404);
    }

    // Deleta a transação
    await prisma.transaction.delete({
      where: { id: transactionId },
    });
  }

  /**
   * Atualiza apenas o status de uma transação
   */
  async updateTransactionStatus(
    userId: string,
    transactionId: string,
    newStatus: 'PAID' | 'PENDING' | 'SCHEDULED'
  ) {
    // Verifica se a transação existe e pertence ao usuário
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
      },
      include: {
        bankAccount: true,
      },
    });

    if (!transaction) {
      throw new AppError('Transação não encontrada', 404);
    }

    const oldStatus = transaction.status;

    // Atualiza o status da transação
    const updatedTransaction = await prisma.$transaction(async (tx) => {
      // Atualiza a transação
      const updated = await tx.transaction.update({
        where: { id: transactionId },
        data: { status: newStatus },
        include: {
          category: true,
          creditCard: true,
          bankAccount: true,
        },
      });

      // Se mudou de não-pago para pago e tem conta bancária, atualiza o saldo
      if (
        oldStatus !== 'PAID' &&
        newStatus === 'PAID' &&
        transaction.bankAccountId
      ) {
        const balanceChange =
          transaction.type === 'INCOME'
            ? transaction.amount
            : -transaction.amount;

        await tx.bankAccount.update({
          where: { id: transaction.bankAccountId },
          data: {
            balance: {
              increment: balanceChange,
            },
          },
        });
      }

      // Se mudou de pago para não-pago e tem conta bancária, reverte o saldo
      if (
        oldStatus === 'PAID' &&
        newStatus !== 'PAID' &&
        transaction.bankAccountId
      ) {
        const balanceChange =
          transaction.type === 'INCOME'
            ? -transaction.amount
            : transaction.amount;

        await tx.bankAccount.update({
          where: { id: transaction.bankAccountId },
          data: {
            balance: {
              increment: balanceChange,
            },
          },
        });
      }

      return updated;
    });

    return updatedTransaction;
  }
}

export default new TransactionsService();
