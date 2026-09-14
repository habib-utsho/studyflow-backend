import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { registerSchema, loginSchema } from './auth.validation';
import * as authController from './auth.controller';
import userRoutes from '../user/user.routes';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.use(userRoutes);

export default router;
