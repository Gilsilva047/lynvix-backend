import { Router } from 'express';
import budgetsController from './budgets.controller';
import { authenticate } from '../../middlewares/auth';
import { validate } from '../../middlewares/validation';
import { createBudgetSchema, updateBudgetSchema } from './budgets.validator';

const router = Router();
router.use(authenticate);

router.get('/', budgetsController.getBudgets);
router.get('/status', budgetsController.getBudgetStatus);
router.post('/', validate(createBudgetSchema), budgetsController.createBudget);
router.put('/:id', validate(updateBudgetSchema), budgetsController.updateBudget);
router.delete('/:id', budgetsController.deleteBudget);

export default router;
