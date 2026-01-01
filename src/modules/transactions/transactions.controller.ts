/**
 * Controller do módulo de transações
 */

import { Request, Response, NextFunction } from 'express';
import transactionsService from './transactions.service';

class TransactionsController {
  /**
   * GET /api/v1/transactions
   */
  async getAllTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const filters = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        type: req.query.type as 'INCOME' | 'EXPENSE' | undefined,
        status: req.query.status as 'PAID' | 'PENDING' | 'SCHEDULED' | undefined,
        categoryId: req.query.categoryId as string | undefined,
        paymentMethod: req.query.paymentMethod as string | undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
        search: req.query.search as string | undefined,
      };

      const result = await transactionsService.getAllTransactions(userId, filters);

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/transactions/:id
   */
  async getTransactionById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const transaction = await transactionsService.getTransactionById(userId, id);

      return res.status(200).json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/transactions
   */
  async createTransaction(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const transaction = await transactionsService.createTransaction(userId, req.body);

      return res.status(201).json({
        success: true,
        message: 'Transação criada com sucesso',
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/transactions/:id
   */
  async updateTransaction(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const transaction = await transactionsService.updateTransaction(userId, id, req.body);

      return res.status(200).json({
        success: true,
        message: 'Transação atualizada com sucesso',
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/transactions/:id
   */
  async deleteTransaction(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      await transactionsService.deleteTransaction(userId, id);

      return res.status(200).json({
        success: true,
        message: 'Transação deletada com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/transactions/:id/status
   */
  async updateTransactionStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const { status } = req.body;

      const transaction = await transactionsService.updateTransactionStatus(
        userId,
        id,
        status
      );

      return res.status(200).json({
        success: true,
        message: 'Status da transação atualizado com sucesso',
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new TransactionsController();
