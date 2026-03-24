import { Router } from 'express';
import { body } from 'express-validator';
import * as projectChatController from '../controllers/projectChat.controller.js';
import * as authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

router.post('/send',
    authMiddleware.authUser,
    body('projectId').notEmpty().withMessage('Project ID is required'),
    body('message').notEmpty().withMessage('Message is required'),
    projectChatController.sendProjectMessage
);

router.get('/messages/:projectId',
    authMiddleware.authUser,
    projectChatController.getProjectMessages
);

router.delete('/delete/:messageId',
    authMiddleware.authUser,
    projectChatController.deleteProjectMessage
);

router.delete('/clear/:projectId',
    authMiddleware.authUser,
    projectChatController.clearProjectMessages
);

export default router;
