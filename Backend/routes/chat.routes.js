import { Router } from 'express';
import { sendMessage, getMessages, getOnlineUsers, joinRoom } from '../controllers/chat.controller.js';
import * as authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware.authUser);

router.post('/send', sendMessage);
router.get('/messages/:roomId', getMessages);
router.get('/online-users', getOnlineUsers);
router.post('/join-room', joinRoom);

export default router;