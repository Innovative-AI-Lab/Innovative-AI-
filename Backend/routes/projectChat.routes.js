import { Router } from 'express';
import { body } from 'express-validator';
import * as projectChatController from '../controllers/projectChat.controller.js';
import * as authMiddleware from '../middleware/auth.middleware.js';
import ProjectChat from '../models/projectChat.model.js';

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

// Simple delete routes without auth for testing
router.delete('/simple-delete/:messageId', async (req, res) => {
    try {
        const { messageId } = req.params;
        await ProjectChat.findByIdAndDelete(messageId);
        res.json({ success: true, message: 'Message deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.delete('/simple-clear/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;
        await ProjectChat.deleteMany({ projectId });
        res.json({ success: true, message: 'Messages cleared' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Simple send message without auth
router.post('/simple-send', async (req, res) => {
    try {
        const { projectId, message, userEmail } = req.body;
        
        console.log('Received message request:', { projectId, message, userEmail });
        
        // Find user by email to get proper sender ID
        const User = (await import('../models/user.model.js')).default;
        const user = await User.findOne({ email: userEmail });
        
        console.log('Found user:', user ? { id: user._id, email: user.email, name: user.name } : 'No user found');
        
        const chatMessage = new ProjectChat({
            projectId,
            sender: user ? user._id : null,
            message
        });

        await chatMessage.save();
        console.log('Message saved:', chatMessage._id);
        
        // Populate sender info for response
        await chatMessage.populate('sender', 'name email');
        
        res.status(201).json({
            success: true,
            message: chatMessage
        });
    } catch (error) {
        console.error('Error in simple-send:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Simple get messages without auth
router.get('/simple-messages/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;
        console.log('Fetching messages for project:', projectId);

        const messages = await ProjectChat.find({ projectId })
            .populate('sender', 'name email')
            .sort({ timestamp: 1 })
            .limit(100);

        console.log('Found messages:', messages.length);
        res.status(200).json({
            success: true,
            messages
        });
    } catch (error) {
        console.error('Error in simple-messages:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;