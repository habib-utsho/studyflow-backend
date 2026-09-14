import { Router } from 'express';
import { auth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createSubjectSchema, updateSubjectSchema, subjectIdSchema } from './subject.validation';
import * as subjectController from './subject.controller';

const router = Router();

router.use(auth);

router.get('/', subjectController.getSubjects);
router.post('/', validate(createSubjectSchema), subjectController.createSubject);
router.patch('/:id', validate(updateSubjectSchema), subjectController.updateSubject);
router.delete('/:id', validate(subjectIdSchema), subjectController.deleteSubject);

export default router;
