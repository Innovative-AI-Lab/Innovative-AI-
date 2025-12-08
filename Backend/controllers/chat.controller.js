import chatService from '../services/chat.service.js';

export const sendMessage = async (req, res) => {
    try {
        const { roomId, sender, text, messageType } = req.body;
        
        const message = await chatService.saveMessage(roomId, sender, text, messageType);
        
        res.status(200).json({
            success: true,
            message: 'Message sent successfully',
            data: message
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error sending message',
            error: error.message
        });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { limit } = req.query;
        
        const messages = await chatService.getMessages(roomId, parseInt(limit) || 50);
        
        res.status(200).json({
            success: true,
            data: messages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error getting messages',
            error: error.message
        });
    }
};

export const getOnlineUsers = async (req, res) => {
    try {
        const users = await chatService.getOnlineUsers();
        
        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error getting online users',
            error: error.message
        });
    }
};

export const joinRoom = async (req, res) => {
    try {
        const { roomId, userId, username } = req.body;
        
        await chatService.createChatRoom(roomId, [userId]);
        await chatService.setUserOnline(userId, username);
        
        res.status(200).json({
            success: true,
            message: 'Joined room successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error joining room',
            error: error.message
        });
    }
};