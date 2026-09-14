import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import taskRoutes from '../modules/task/task.routes';
import goalRoutes from '../modules/goal/goal.routes';
import subjectRoutes from '../modules/subject/subject.routes';
import statsRoutes from '../modules/stats/stats.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/goals', goalRoutes);
router.use('/subjects', subjectRoutes);
router.use('/stats', statsRoutes);

export default router;
