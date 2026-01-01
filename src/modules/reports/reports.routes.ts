import { Router } from 'express';
import reportsController from './reports.controller';
import { authenticate } from '../../middlewares/auth';

const router = Router();
router.use(authenticate);

router.get('/summary', reportsController.getMonthlySummary);
router.get('/by-category', reportsController.getExpensesByCategory);
router.get('/by-payment-method', reportsController.getExpensesByPaymentMethod);
router.get('/evolution', reportsController.getEvolution);

export default router;
