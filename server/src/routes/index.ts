import { Router } from 'express';
import { requireFirebaseUser } from '../middleware/require-firebase-user.js';
import profileRouter from './profiles.js';
import suggestionsRouter from './suggestions.js';

const router = Router();

router.use('/profiles', requireFirebaseUser, profileRouter);
router.use(suggestionsRouter);

export default router;
