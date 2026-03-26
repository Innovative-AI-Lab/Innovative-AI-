import ActivityService from '../services/activity.service.js';

export const logActivity = async (req, res) => {
    try {
        const { userId, action, description, metadata, projectId, category, tags, priority } = req.body;

        if (!userId || !action || !description) {
            return res.status(400).json({
                success: false,
                message: 'userId, action, and description are required'
            });
        }

        const activity = await ActivityService.logActivity(
            userId,
            action,
            description,
            metadata,
            projectId,
            { category, tags, priority }
        );

        // Emit real-time update via Socket.IO
        if (global.io) {
            const roomId = projectId ? `activity-${projectId}` : 'activity-global';
            global.io.to(roomId).emit('activity-logged', {
                activity: activity
            });
        }

        res.status(201).json({
            success: true,
            activity
        });
    } catch (error) {
        console.error('Error logging activity:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to log activity'
        });
    }
};

export const getRecentActivities = async (req, res) => {
    try {
        const hours = parseInt(req.query.hours) || 24;
        const activities = await ActivityService.getRecentActivities(hours);

        res.json({
            success: true,
            activities
        });
    } catch (error) {
        console.error('Error getting recent activities:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get recent activities'
        });
    }
};

export const getUserActivities = async (req, res) => {
    try {
        const { userId } = req.params;
        const options = {
            userId,
            limit: parseInt(req.query.limit) || 50,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            search: req.query.search
        };

        const activities = await ActivityService.getActivities(options);

        res.json({
            success: true,
            activities
        });
    } catch (error) {
        console.error('Error getting user activities:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user activities'
        });
    }
};

export const getProjectActivities = async (req, res) => {
    try {
        const { projectId } = req.params;
        const options = {
            projectId,
            limit: parseInt(req.query.limit) || 50,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            search: req.query.search
        };

        const activities = await ActivityService.getActivities(options);

        res.json({
            success: true,
            activities
        });
    } catch (error) {
        console.error('Error getting project activities:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get project activities'
        });
    }
};

export const getActivities = async (req, res) => {
    try {
        const options = {
            limit: parseInt(req.query.limit) || 50,
            userId: req.query.userId,
            projectId: req.query.projectId,
            action: req.query.action,
            category: req.query.category,
            tags: req.query.tags ? req.query.tags.split(',') : [],
            priority: req.query.priority,
            isRead: req.query.isRead ? req.query.isRead === 'true' : null,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            search: req.query.search
        };

        const activities = await ActivityService.getActivities(options);

        res.json({
            success: true,
            activities
        });
    } catch (error) {
        console.error('Error getting activities:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get activities'
        });
    }
};

export const getActivityAnalytics = async (req, res) => {
    try {
        const options = {
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            userId: req.query.userId,
            projectId: req.query.projectId
        };

        const analytics = await ActivityService.getActivityAnalytics(options);

        res.json({
            success: true,
            analytics
        });
    } catch (error) {
        console.error('Error getting activity analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get activity analytics'
        });
    }
};

export const getActivityStats = async (req, res) => {
    try {
        const options = {
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            userId: req.query.userId,
            projectId: req.query.projectId
        };

        const stats = await ActivityService.getActivityStats(options);

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Error getting activity stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get activity stats'
        });
    }
};

export const markActivitiesAsRead = async (req, res) => {
    try {
        const { activityIds } = req.body;
        const userId = req.user._id; // Assuming auth middleware sets req.user

        const count = await ActivityService.markActivitiesAsRead(userId, activityIds);

        res.json({
            success: true,
            message: `Marked ${count} activities as read`
        });
    } catch (error) {
        console.error('Error marking activities as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark activities as read'
        });
    }
};

export const deleteActivities = async (req, res) => {
    try {
        const { activityIds } = req.body;

        if (!activityIds || !Array.isArray(activityIds)) {
            return res.status(400).json({
                success: false,
                message: 'activityIds array is required'
            });
        }

        const count = await ActivityService.deleteActivities(activityIds);

        res.json({
            success: true,
            message: `Deleted ${count} activities`
        });
    } catch (error) {
        console.error('Error deleting activities:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete activities'
        });
    }
};

export const exportActivities = async (req, res) => {
    try {
        const options = {
            userId: req.query.userId,
            projectId: req.query.projectId,
            action: req.query.action,
            category: req.query.category,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            search: req.query.search,
            limit: 10000 // Export limit
        };

        const { headers, rows } = await ActivityService.exportActivities(options);

        // Convert to CSV
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="activities.csv"');

        res.send(csvContent);
    } catch (error) {
        console.error('Error exporting activities:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export activities'
        });
    }
};