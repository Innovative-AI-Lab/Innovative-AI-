import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller.js';
import * as authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware.authUser);

router.post('/', notificationController.createNotification);
router.get('/', notificationController.getNotifications);
router.put('/:id/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);
router.get('/unread-count', notificationController.getUnreadCount);

export default router;