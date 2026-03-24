import Activity from '../models/activity.model.js';

class ActivityService {
    async logActivity(userId, action, description, metadata = {}, projectId = null) {
        try {
            const activity = new Activity({
                user: userId,
                action,
                description,
                metadata,
                project: projectId
            });
            await activity.save();
            return activity;
        } catch (error) {
            console.error('Error logging activity:', error);
            throw error;
        }
    }

    async getActivities(limit = 50, userId = null, projectId = null) {
        try {
            let query = {};
            if (userId) query.user = userId;
            if (projectId) query.project = projectId;

            const activities = await Activity.find(query)
                .populate('user', 'displayName email')
                .populate('project', 'name')
                .sort({ timestamp: -1 })
                .limit(limit);

            return activities;
        } catch (error) {
            console.error('Error getting activities:', error);
            throw error;
        }
    }

    async getRecentActivities(hours = 24) {
        try {
            const since = new Date(Date.now() - hours * 60 * 60 * 1000);
            const activities = await Activity.find({ timestamp: { $gte: since } })
                .populate('user', 'displayName email')
                .populate('project', 'name')
                .sort({ timestamp: -1 })
                .limit(100);

            return activities;
        } catch (error) {
            console.error('Error getting recent activities:', error);
            throw error;
        }
    }
}

export default new ActivityService();