import { Router } from 'express';
import * as activityController from '../controllers/activity.controller.js';
import * as authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware.authUser);

router.get('/recent', activityController.getRecentActivities);
router.get('/user/:userId', activityController.getUserActivities);
router.get('/project/:projectId', activityController.getProjectActivities);
router.post('/log', activityController.logActivity);

export default router;