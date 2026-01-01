import { Router } from 'express';
import accountsController from './accounts.controller';
import { authenticate } from '../../middlewares/auth';
import { validate } from '../../middlewares/validation';
import { createAccountSchema, updateAccountSchema, transferSchema } from './accounts.validator';

const router = Router();
router.use(authenticate);

router.get('/', accountsController.getAllAccounts);
router.get('/:id', accountsController.getAccountById);
router.post('/', validate(createAccountSchema), accountsController.createAccount);
router.put('/:id', validate(updateAccountSchema), accountsController.updateAccount);
router.delete('/:id', accountsController.deleteAccount);
router.post('/transfer', validate(transferSchema), accountsController.createTransfer);

export default router;
