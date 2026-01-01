import { Router } from 'express';
import goalsController from './goals.controller';
import { authenticate } from '../../middlewares/auth';
import { validate } from '../../middlewares/validation';
import { createGoalSchema, updateGoalSchema, contributeGoalSchema } from './goals.validator';

const router = Router();
router.use(authenticate);

router.get('/', goalsController.getAllGoals);
router.get('/:id', goalsController.getGoalById);
router.post('/', validate(createGoalSchema), goalsController.createGoal);
router.put('/:id', validate(updateGoalSchema), goalsController.updateGoal);
router.delete('/:id', goalsController.deleteGoal);
router.post('/:id/contribute', validate(contributeGoalSchema), goalsController.contributeToGoal);

export default router;
