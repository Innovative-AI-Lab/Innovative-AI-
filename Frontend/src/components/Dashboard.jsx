import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/user.context';
import axios from '../config/axios';

const Dashboard = () => {
    const { user } = useContext(UserContext);
    const [stats, setStats] = useState({
        totalProjects: 0,
        activeChats: 0,
        aiInteractions: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const projectsRes = await axios.get('/projects/all');
            setStats(prev => ({
                ...prev,
                totalProjects: projectsRes.data.projects?.length || 0
            }));

            // Mock recent activity
            setRecentActivity([
                { id: 1, action: 'Created new project', time: '2 hours ago', icon: 'ri-folder-add-fill' },
                { id: 2, action: 'AI generated code snippet', time: '4 hours ago', icon: 'ri-robot-fill' },
                { id: 3, action: 'Added collaborator', time: '1 day ago', icon: 'ri-user-add-fill' },
                { id: 4, action: 'Chat message sent', time: '2 days ago', icon: 'ri-chat-3-fill' }
            ]);
        } catch (error) {
            console.error('Dashboard data fetch error:', error);
        }
    };

    return (
        <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome back, {user?.email?.split('@')[0] || 'User'}!
                    </h1>
                    <p className="text-gray-600 mt-2">Here's what's happening with your projects</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                                <i className="ri-folder-fill text-2xl"></i>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-green-100 text-green-600">
                                <i className="ri-chat-3-fill text-2xl"></i>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Active Chats</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.activeChats}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                                <i className="ri-robot-fill text-2xl"></i>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">AI Interactions</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.aiInteractions}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-center">
                                    <div className="p-2 rounded-full bg-gray-100 text-gray-600">
                                        <i className={`${activity.icon} text-lg`}></i>
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                                        <p className="text-sm text-gray-500">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;