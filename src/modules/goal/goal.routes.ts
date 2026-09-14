import { Router } from 'express';
import { auth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createGoalSchema, updateGoalSchema, goalIdSchema } from './goal.validation';
import * as goalController from './goal.controller';

const router = Router();

router.use(auth);

router.get('/', goalController.getGoals);
router.post('/', validate(createGoalSchema), goalController.createGoal);
router.get('/:id', validate(goalIdSchema), goalController.getGoalById);
router.patch('/:id', validate(updateGoalSchema), goalController.updateGoal);
router.delete('/:id', validate(goalIdSchema), goalController.deleteGoal);

export default router;
