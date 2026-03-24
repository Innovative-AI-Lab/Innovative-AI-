import activityService from '../services/activity.service.js';

export const logActivity = async (req, res) => {
    try {
        const { action, description, metadata, projectId } = req.body;
        const activity = await activityService.logActivity(req.user._id, action, description, metadata, projectId);
        res.status(201).json({ success: true, activity });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getRecentActivities = async (req, res) => {
    try {
        const { hours } = req.query;
        const activities = await activityService.getRecentActivities(parseInt(hours) || 24);
        res.status(200).json({ success: true, activities });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getUserActivities = async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit } = req.query;
        const activities = await activityService.getActivities(parseInt(limit) || 50, userId);
        res.status(200).json({ success: true, activities });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getProjectActivities = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { limit } = req.query;
        const activities = await activityService.getActivities(parseInt(limit) || 50, null, projectId);
        res.status(200).json({ success: true, activities });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};