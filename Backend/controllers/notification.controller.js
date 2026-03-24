import notificationService from '../services/notification.service.js';

export const createNotification = async (req, res) => {
    try {
        const { type, title, message, data } = req.body;
        const notification = await notificationService.createNotification(req.user._id, type, title, message, data);
        res.status(201).json({ success: true, notification });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getNotifications = async (req, res) => {
    try {
        const { limit, unreadOnly } = req.query;
        const notifications = await notificationService.getUserNotifications(
            req.user._id,
            parseInt(limit) || 50,
            unreadOnly === 'true'
        );
        res.status(200).json({ success: true, notifications });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await notificationService.markAsRead(id, req.user._id);
        if (!notification) {
            return res.status(404).json({ success: false, error: 'Notification not found' });
        }
        res.status(200).json({ success: true, notification });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        await notificationService.markAllAsRead(req.user._id);
        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getUnreadCount = async (req, res) => {
    try {
        const count = await notificationService.getUnreadCount(req.user._id);
        res.status(200).json({ success: true, count });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};