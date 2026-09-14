import { Router } from 'express';
import { auth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { updateProfileSchema, changePasswordSchema } from './user.validation';
import * as userController from './user.controller';

const router = Router();

router.get('/me', auth, userController.getMe);
router.patch('/me', auth, validate(updateProfileSchema), userController.updateMe);
router.patch('/change-password', auth, validate(changePasswordSchema), userController.changePassword);

export default router;
