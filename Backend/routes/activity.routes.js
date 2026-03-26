import { Router } from 'express';
import * as activityController from '../controllers/activity.controller.js';
import * as authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware.authUser);

// Core activity endpoints
router.get('/recent', activityController.getRecentActivities);
router.get('/user/:userId', activityController.getUserActivities);
router.get('/project/:projectId', activityController.getProjectActivities);
router.get('/', activityController.getActivities);
router.post('/log', activityController.logActivity);

// Advanced analytics and management
router.get('/analytics', activityController.getActivityAnalytics);
router.get('/stats', activityController.getActivityStats);
router.put('/mark-read', activityController.markActivitiesAsRead);
router.delete('/bulk', activityController.deleteActivities);
router.get('/export', activityController.exportActivities);

export default router;