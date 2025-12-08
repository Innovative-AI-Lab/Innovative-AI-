import { Router } from 'express';
import { sendMessage, getMessages, getOnlineUsers, joinRoom } from '../controllers/chat.controller.js';

const router = Router();

router.post('/send', sendMessage);
router.get('/messages/:roomId', getMessages);
router.get('/online-users', getOnlineUsers);
router.post('/join-room', joinRoom);

export default router;