import { Router } from 'express';
import { auth } from '../../middleware/auth';
import * as statsController from './stats.controller';

const router = Router();

router.use(auth);

router.get('/overview', statsController.getOverview);
router.get('/weekly', statsController.getWeekly);
router.get('/by-subject', statsController.getBySubject);

export default router;
