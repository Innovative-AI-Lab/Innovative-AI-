import notificationService from '../services/notification.service.js';
import { successResponse, errorResponse } from '../utils/response.util.js';

export const createNotification = async (req, res) => {
    try {
        const { type, title, message, data } = req.body;
        const notification = await notificationService.createNotification(req.user._id, type, title, message, data);
        return successResponse(res, notification, 'Notification created', 201);
    } catch (error) {
        return errorResponse(res, error.message, 500, error);
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
        return successResponse(res, { notifications }, 'Notifications retrieved');
    } catch (error) {
        return errorResponse(res, error.message, 500, error);
    }
};

export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await notificationService.markAsRead(id, req.user._id);
        if (!notification) {
            return errorResponse(res, 'Notification not found', 404);
        }
        return successResponse(res, notification, 'Notification marked as read');
    } catch (error) {
        return errorResponse(res, error.message, 500, error);
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        await notificationService.markAllAsRead(req.user._id);
        return successResponse(res, null, 'All notifications marked as read');
    } catch (error) {
        return errorResponse(res, error.message, 500, error);
    }
};

export const getUnreadCount = async (req, res) => {
    try {
        const count = await notificationService.getUnreadCount(req.user._id);
        return successResponse(res, { count }, 'Unread count retrieved');
    } catch (error) {
        return errorResponse(res, error.message, 500, error);
    }
};