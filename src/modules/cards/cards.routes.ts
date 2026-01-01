import { Router } from 'express';
import cardsController from './cards.controller';
import { authenticate } from '../../middlewares/auth';
import { validate } from '../../middlewares/validation';
import { createCardSchema, updateCardSchema } from './cards.validator';

const router = Router();
router.use(authenticate);

router.get('/', cardsController.getAllCards);
router.get('/:id', cardsController.getCardById);
router.post('/', validate(createCardSchema), cardsController.createCard);
router.put('/:id', validate(updateCardSchema), cardsController.updateCard);
router.delete('/:id', cardsController.deleteCard);
router.get('/:id/invoice', cardsController.getCardInvoice);

export default router;
