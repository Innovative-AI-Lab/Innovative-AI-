import Notification from '../models/notification.model.js';

class NotificationService {
    async createNotification(userId, type, title, message, data = {}) {
        try {
            const notification = new Notification({
                user: userId,
                type,
                title,
                message,
                data
            });
            await notification.save();
            return notification;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    async getUserNotifications(userId, limit = 50, unreadOnly = false) {
        try {
            let query = { user: userId };
            if (unreadOnly) query.read = false;

            const notifications = await Notification.find(query)
                .sort({ createdAt: -1 })
                .limit(limit);

            return notifications;
        } catch (error) {
            console.error('Error getting notifications:', error);
            throw error;
        }
    }

    async markAsRead(notificationId, userId) {
        try {
            const notification = await Notification.findOneAndUpdate(
                { _id: notificationId, user: userId },
                { read: true },
                { new: true }
            );
            return notification;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }

    async markAllAsRead(userId) {
        try {
            await Notification.updateMany(
                { user: userId, read: false },
                { read: true }
            );
            return true;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    }

    async getUnreadCount(userId) {
        try {
            const count = await Notification.countDocuments({ user: userId, read: false });
            return count;
        } catch (error) {
            console.error('Error getting unread count:', error);
            throw error;
        }
    }
}

export default new NotificationService();