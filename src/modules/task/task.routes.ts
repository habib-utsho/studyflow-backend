import { Router } from 'express';
import { auth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import {
  createTaskSchema,
  updateTaskSchema,
  taskIdSchema,
  getTasksQuerySchema,
} from './task.validation';
import * as taskController from './task.controller';

const router = Router();

router.use(auth);

router.get('/', validate(getTasksQuerySchema), taskController.getTasks);
router.post('/', validate(createTaskSchema), taskController.createTask);
router.delete('/completed', taskController.deleteCompletedTasks);
router.get('/:id', validate(taskIdSchema), taskController.getTaskById);
router.patch('/:id', validate(updateTaskSchema), taskController.updateTask);
router.patch('/:id/toggle', validate(taskIdSchema), taskController.toggleTask);
router.delete('/:id', validate(taskIdSchema), taskController.deleteTask);

export default router;
