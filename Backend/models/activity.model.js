import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: ['created_project', 'updated_project', 'deleted_project', 'added_member', 'joined_project', 'left_project', 'sent_message', 'ai_chat', 'code_generated', 'settings_updated', 'login', 'logout', 'file_uploaded', 'file_deleted', 'comment_added', 'task_completed', 'milestone_reached', 'custom']
    },
    category: {
        type: String,
        enum: ['project', 'user', 'system', 'communication', 'development', 'management', 'custom'],
        default: 'system'
    },
    description: {
        type: String,
        required: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    tags: [{
        type: String
    }],
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Indexes for better performance
activitySchema.index({ user: 1, timestamp: -1 });
activitySchema.index({ project: 1, timestamp: -1 });
activitySchema.index({ action: 1, timestamp: -1 });
activitySchema.index({ category: 1, timestamp: -1 });
activitySchema.index({ timestamp: -1 });
activitySchema.index({ isRead: 1, user: 1 });

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;