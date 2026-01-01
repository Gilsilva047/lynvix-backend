/**
 * Rotas do módulo de transações
 */

import { Router } from 'express';
import transactionsController from './transactions.controller';
import { authenticate } from '../../middlewares/auth';
import { validate } from '../../middlewares/validation';
import {
  createTransactionSchema,
  updateTransactionSchema,
  deleteTransactionSchema,
  getTransactionsSchema,
  updateTransactionStatusSchema,
} from './transactions.validator';

const router = Router();

// Todas as rotas exigem autenticação
router.use(authenticate);

// GET /api/v1/transactions
router.get('/', validate(getTransactionsSchema), transactionsController.getAllTransactions);

// GET /api/v1/transactions/:id
router.get('/:id', transactionsController.getTransactionById);

// POST /api/v1/transactions
router.post('/', validate(createTransactionSchema), transactionsController.createTransaction);

// PUT /api/v1/transactions/:id
router.put('/:id', validate(updateTransactionSchema), transactionsController.updateTransaction);

// PATCH /api/v1/transactions/:id/status
router.patch(
  '/:id/status',
  validate(updateTransactionStatusSchema),
  transactionsController.updateTransactionStatus
);

// DELETE /api/v1/transactions/:id
router.delete(
  '/:id',
  validate(deleteTransactionSchema),
  transactionsController.deleteTransaction
);

export default router;
