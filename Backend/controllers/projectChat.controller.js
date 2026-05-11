import ProjectChat from '../models/projectChat.model.js';
import userModel from '../models/user.model.js';
import { successResponse, errorResponse } from '../utils/response.util.js';

export const sendProjectMessage = async (req, res) => {
    try {
        const { projectId, message } = req.body;
        const userEmail = req.user.email;

        let senderId;
        
        // Check if it's an AI message
        if (message.startsWith('🤖 AI Assistant:')) {
            senderId = null; 
        } else {
            const user = await userModel.findOne({ email: userEmail });
            if (!user) {
                return errorResponse(res, 'User not found', 404);
            }
            senderId = user._id;
        }

        const chatMessage = new ProjectChat({
            projectId,
            sender: senderId,
            message
        });

        await chatMessage.save();
        await chatMessage.populate('sender', 'displayName email');

        // Emit via socket if available
        if (global.io) {
            global.io.to(projectId).emit('new-message', chatMessage);
        }

        return successResponse(res, chatMessage, 'Message sent successfully', 201);
    } catch (error) {
        return errorResponse(res, error.message, 500, error);
    }
};

export const getProjectMessages = async (req, res) => {
    try {
        const { projectId } = req.params;

        const messages = await ProjectChat.find({ projectId })
            .populate('sender', 'displayName email')
            .sort({ timestamp: 1 })
            .limit(100);

        return successResponse(res, messages, 'Messages retrieved successfully');
    } catch (error) {
        return errorResponse(res, error.message, 500, error);
    }
};

export const deleteProjectMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        
        await ProjectChat.findByIdAndDelete(messageId);

        return successResponse(res, null, 'Message deleted successfully');
    } catch (error) {
        console.error('Delete message error:', error);
        return errorResponse(res, error.message, 500, error);
    }
};

export const clearProjectMessages = async (req, res) => {
    try {
        const { projectId } = req.params;
        
        await ProjectChat.deleteMany({ projectId });

        return successResponse(res, null, 'All messages cleared successfully');
    } catch (error) {
        console.error('Clear messages error:', error);
        return errorResponse(res, error.message, 500, error);
    }
};