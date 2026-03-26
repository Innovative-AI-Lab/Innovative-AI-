import Activity from '../models/activity.model.js';

class ActivityService {
    async logActivity(userId, action, description, metadata = {}, projectId = null, options = {}) {
        try {
            const activity = new Activity({
                user: userId,
                action,
                description,
                metadata,
                project: projectId,
                category: options.category || this.getDefaultCategory(action),
                tags: options.tags || [],
                priority: options.priority || 'medium'
            });
            await activity.save();

            // Populate user and project data for real-time emission
            await activity.populate('user', 'displayName email');
            await activity.populate('project', 'name');

            return activity;
        } catch (error) {
            console.error('Error logging activity:', error);
            throw error;
        }
    }

    getDefaultCategory(action) {
        const categoryMap = {
            'created_project': 'project',
            'joined_project': 'project',
            'left_project': 'project',
            'sent_message': 'communication',
            'ai_chat': 'development',
            'code_generated': 'development',
            'file_uploaded': 'management',
            'file_deleted': 'management',
            'comment_added': 'communication',
            'task_completed': 'management',
            'milestone_reached': 'project',
            'settings_updated': 'system',
            'login': 'user',
            'logout': 'user'
        };
        return categoryMap[action] || 'system';
    }

    async getActivities(options = {}) {
        try {
            const {
                limit = 50,
                userId = null,
                projectId = null,
                action = null,
                category = null,
                tags = [],
                priority = null,
                isRead = null,
                startDate = null,
                endDate = null,
                search = null
            } = options;

            let query = {};

            if (userId) query.user = userId;
            if (projectId) query.project = projectId;
            if (action) query.action = action;
            if (category) query.category = category;
            if (priority) query.priority = priority;
            if (isRead !== null) query.isRead = isRead;
            if (tags.length > 0) query.tags = { $in: tags };

            // Date range
            if (startDate || endDate) {
                query.timestamp = {};
                if (startDate) query.timestamp.$gte = new Date(startDate);
                if (endDate) query.timestamp.$lte = new Date(endDate);
            }

            // Search functionality
            if (search) {
                query.$or = [
                    { description: { $regex: search, $options: 'i' } },
                    { 'metadata.details': { $regex: search, $options: 'i' } }
                ];
            }

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

    async getActivityAnalytics(options = {}) {
        try {
            const { startDate, endDate, userId, projectId } = options;

            let matchQuery = {};
            if (startDate || endDate) {
                matchQuery.timestamp = {};
                if (startDate) matchQuery.timestamp.$gte = new Date(startDate);
                if (endDate) matchQuery.timestamp.$lte = new Date(endDate);
            }
            if (userId) matchQuery.user = userId;
            if (projectId) matchQuery.project = projectId;

            const analytics = await Activity.aggregate([
                { $match: matchQuery },
                {
                    $group: {
                        _id: {
                            date: {
                                $dateToString: {
                                    format: '%Y-%m-%d',
                                    date: '$timestamp'
                                }
                            },
                            action: '$action',
                            category: '$category'
                        },
                        count: { $sum: 1 },
                        users: { $addToSet: '$user' },
                        projects: { $addToSet: '$project' }
                    }
                },
                {
                    $group: {
                        _id: '$_id.date',
                        actions: {
                            $push: {
                                action: '$_id.action',
                                category: '$_id.category',
                                count: '$count'
                            }
                        },
                        totalActivities: { $sum: '$count' },
                        uniqueUsers: { $addToSet: '$users' },
                        uniqueProjects: { $addToSet: '$projects' }
                    }
                },
                {
                    $project: {
                        date: '$_id',
                        actions: 1,
                        totalActivities: 1,
                        uniqueUsersCount: { $size: { $reduce: { input: '$uniqueUsers', initialValue: [], in: { $setUnion: ['$$value', '$$this'] } } } },
                        uniqueProjectsCount: { $size: { $reduce: { input: '$uniqueProjects', initialValue: [], in: { $setUnion: ['$$value', '$$this'] } } } }
                    }
                },
                { $sort: { date: -1 } },
                { $limit: 30 }
            ]);

            return analytics;
        } catch (error) {
            console.error('Error getting activity analytics:', error);
            throw error;
        }
    }

    async markActivitiesAsRead(userId, activityIds = null) {
        try {
            let query = { user: userId, isRead: false };
            if (activityIds) {
                query._id = { $in: activityIds };
            }

            const result = await Activity.updateMany(query, { isRead: true });
            return result.modifiedCount;
        } catch (error) {
            console.error('Error marking activities as read:', error);
            throw error;
        }
    }

    async deleteActivities(activityIds) {
        try {
            const result = await Activity.deleteMany({ _id: { $in: activityIds } });
            return result.deletedCount;
        } catch (error) {
            console.error('Error deleting activities:', error);
            throw error;
        }
    }

    async getActivityStats(options = {}) {
        try {
            const { startDate, endDate, userId, projectId } = options;

            let matchQuery = {};
            if (startDate || endDate) {
                matchQuery.timestamp = {};
                if (startDate) matchQuery.timestamp.$gte = new Date(startDate);
                if (endDate) matchQuery.timestamp.$lte = new Date(endDate);
            }
            if (userId) matchQuery.user = userId;
            if (projectId) matchQuery.project = projectId;

            const stats = await Activity.aggregate([
                { $match: matchQuery },
                {
                    $group: {
                        _id: null,
                        totalActivities: { $sum: 1 },
                        unreadActivities: {
                            $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
                        },
                        uniqueUsers: { $addToSet: '$user' },
                        uniqueProjects: { $addToSet: '$project' },
                        actionsBreakdown: {
                            $push: '$action'
                        },
                        categoriesBreakdown: {
                            $push: '$category'
                        }
                    }
                },
                {
                    $project: {
                        totalActivities: 1,
                        unreadActivities: 1,
                        uniqueUsersCount: { $size: '$uniqueUsers' },
                        uniqueProjectsCount: { $size: '$uniqueProjects' },
                        actionsBreakdown: {
                            $reduce: {
                                input: '$actionsBreakdown',
                                initialValue: {},
                                in: {
                                    $mergeObjects: [
                                        '$$value',
                                        { ['$$this']: { $add: [{ $ifNull: ['$$value.$$this', 0] }, 1] } }
                                    ]
                                }
                            }
                        },
                        categoriesBreakdown: {
                            $reduce: {
                                input: '$categoriesBreakdown',
                                initialValue: {},
                                in: {
                                    $mergeObjects: [
                                        '$$value',
                                        { ['$$this']: { $add: [{ $ifNull: ['$$value.$$this', 0] }, 1] } }
                                    ]
                                }
                            }
                        }
                    }
                }
            ]);

            return stats[0] || {
                totalActivities: 0,
                unreadActivities: 0,
                uniqueUsersCount: 0,
                uniqueProjectsCount: 0,
                actionsBreakdown: {},
                categoriesBreakdown: {}
            };
        } catch (error) {
            console.error('Error getting activity stats:', error);
            throw error;
        }
    }

    async exportActivities(options = {}) {
        try {
            const activities = await this.getActivities({ ...options, limit: 10000 });

            // Convert to CSV format
            const csvHeaders = ['Date', 'Time', 'User', 'Action', 'Category', 'Description', 'Project', 'Priority', 'Tags'];
            const csvRows = activities.map(activity => [
                new Date(activity.timestamp).toLocaleDateString(),
                new Date(activity.timestamp).toLocaleTimeString(),
                activity.user.displayName || activity.user.email,
                activity.action,
                activity.category,
                activity.description,
                activity.project?.name || '',
                activity.priority,
                activity.tags.join('; ')
            ]);

            return { headers: csvHeaders, rows: csvRows };
        } catch (error) {
            console.error('Error exporting activities:', error);
            throw error;
        }
    }
}

export default new ActivityService();