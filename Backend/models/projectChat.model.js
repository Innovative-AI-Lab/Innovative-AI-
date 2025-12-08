import mongoose from 'mongoose';

const projectChatSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'project',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Allow null for AI messages
    },
    senderEmail: {
        type: String,
        required: false // Store email for identification
    },
    message: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const ProjectChat = mongoose.model('ProjectChat', projectChatSchema);
export default ProjectChat;