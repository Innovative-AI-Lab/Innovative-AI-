import ProjectChat from '../models/projectChat.model.js';
import userModel from '../models/user.model.js';

export const sendProjectMessage = async (req, res) => {
    try {
        const { projectId, message } = req.body;
        const userEmail = req.user.email;

        let senderId;
        
        // Check if it's an AI message
        if (message.startsWith('🤖 AI Assistant:')) {
            // Create a system/AI user entry or use a special ID
            senderId = null; // AI messages don't have a real user sender
        } else {
            const user = await userModel.findOne({ email: userEmail });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            senderId = user._id;
        }

        const chatMessage = new ProjectChat({
            projectId,
            sender: senderId,
            message
        });

        await chatMessage.save();
        
        // Populate sender info for response
        await chatMessage.populate('sender', 'displayName email');

        res.status(201).json({
            success: true,
            message: chatMessage
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const getProjectMessages = async (req, res) => {
    try {
        const { projectId } = req.params;

        const messages = await ProjectChat.find({ projectId })
            .populate('sender', 'displayName email')
            .sort({ timestamp: 1 })
            .limit(100);

        res.status(200).json({
            success: true,
            messages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const deleteProjectMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        
        await ProjectChat.findByIdAndDelete(messageId);

        res.status(200).json({
            success: true,
            message: 'Message deleted successfully'
        });
    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const clearProjectMessages = async (req, res) => {
    try {
        const { projectId } = req.params;
        
        await ProjectChat.deleteMany({ projectId });

        res.status(200).json({
            success: true,
            message: 'All messages cleared successfully'
        });
    } catch (error) {
        console.error('Clear messages error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};