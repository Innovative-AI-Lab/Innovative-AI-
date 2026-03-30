import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import io from 'socket.io-client';
import axios from '../../config/axios';
import { UserContext } from '../../context/user.context';
import PageView from '../common/PageView';
import { BRAND } from '../../constants';

function ActivityView({ projects, displayName }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [viewMode, setViewMode] = useState('feed'); // 'feed', 'analytics', 'manage'
  const [showFilters, setShowFilters] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);

  // Filters
  const [filters, setFilters] = useState({
    timeRange: '24h',
    category: 'all',
    action: 'all',
    priority: 'all',
    project: 'all',
    user: 'all',
    search: '',
    startDate: '',
    endDate: ''
  });

  const { user, addToast } = useContext(UserContext);
  const socketRef = useRef(null);

  // Initialize real-time updates
  useEffect(() => {
    if (realTimeEnabled && !socketRef.current) {
      const socket = io(import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:4001', {
        auth: { token: localStorage.getItem('token') }
      });

      socket.on('connect', () => {
        socket.emit('join-activity-room', 'global');
        projects.forEach(p => socket.emit('join-activity-room', p._id));
      });

      socket.on('activity-logged', (data) => {
        setActivities(prev => [data.activity, ...prev]);
        fetchStats(); // Update stats in real-time
      });

      socketRef.current = socket;
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [realTimeEnabled, projects]);

  // Fetch activities with filters
  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      // Time range
      if (filters.timeRange !== 'custom') {
        const hours = {
          '1h': 1, '6h': 6, '24h': 24, '7d': 168, '30d': 720, 'all': null
        }[filters.timeRange];
        if (hours) params.append('hours', hours);
      } else {
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
      }

      // Other filters
      if (filters.category !== 'all') params.append('category', filters.category);
      if (filters.action !== 'all') params.append('action', filters.action);
      if (filters.priority !== 'all') params.append('priority', filters.priority);
      if (filters.project !== 'all') params.append('projectId', filters.project);
      if (filters.user !== 'all') params.append('userId', filters.user);
      if (filters.search) params.append('search', filters.search);

      const response = await axios.get(`/activity?${params}`);
      if (response.data.success) {
        setActivities(response.data.activities);
      }
    } catch (error) {
      console.error('Failed to load activities:', error);
      addToast('Failed to load activities', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.project !== 'all') params.append('projectId', filters.project);

      const response = await axios.get(`/activity/analytics?${params}`);
      if (response.data.success) {
        setAnalytics(response.data.analytics);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.project !== 'all') params.append('projectId', filters.project);

      const response = await axios.get(`/activity/stats?${params}`);
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  useEffect(() => {
    fetchActivities();
    fetchAnalytics();
    fetchStats();
  }, [filters]);

  // Bulk operations
  const handleMarkAsRead = async () => {
    if (selectedActivities.length === 0) return;

    try {
      await axios.put('/activity/mark-read', { activityIds: selectedActivities });
      setActivities(prev => prev.map(a =>
        selectedActivities.includes(a._id) ? { ...a, isRead: true } : a
      ));
      setSelectedActivities([]);
      addToast(`Marked ${selectedActivities.length} activities as read`);
    } catch (error) {
      addToast('Failed to mark activities as read', 'error');
    }
  };

  const handleDeleteActivities = async () => {
    if (selectedActivities.length === 0) return;
    if (!window.confirm(`Delete ${selectedActivities.length} activities? This cannot be undone.`)) return;

    try {
      await axios.delete('/activity/bulk', { data: { activityIds: selectedActivities } });
      setActivities(prev => prev.filter(a => !selectedActivities.includes(a._id)));
      setSelectedActivities([]);
      addToast(`Deleted ${selectedActivities.length} activities`);
    } catch (error) {
      addToast('Failed to delete activities', 'error');
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') params.append(key, value);
      });

      const response = await axios.get(`/activity/export?${params}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'activities.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      setShowExportModal(false);
      addToast('Activities exported successfully');
    } catch (error) {
      addToast('Failed to export activities', 'error');
    }
  };

  // Activity icons and colors
  function getActivityIcon(action) {
    const icons = {
      'created_project': '📁', 'joined_project': '👥', 'left_project': '🚪',
      'sent_message': '💬', 'ai_chat': '🤖', 'code_generated': '✦',
      'settings_updated': '◱', 'login': '🔑', 'logout': '🚪',
      'file_uploaded': '📤', 'file_deleted': '🗑', 'comment_added': '💭',
      'task_completed': '✅', 'milestone_reached': '🏆', 'custom': '📝'
    };
    return icons[action] || '📝';
  }

  function getActivityColor(action) {
    const colors = {
      'created_project': 'text-violet-400', 'joined_project': 'text-emerald-400',
      'left_project': 'text-orange-400', 'sent_message': 'text-blue-400',
      'ai_chat': 'text-cyan-400', 'code_generated': 'text-amber-400',
      'settings_updated': 'text-pink-400', 'login': 'text-green-400',
      'logout': 'text-red-400', 'file_uploaded': 'text-indigo-400',
      'file_deleted': 'text-red-400', 'comment_added': 'text-purple-400',
      'task_completed': 'text-emerald-400', 'milestone_reached': 'text-yellow-400'
    };
    return colors[action] || 'text-zinc-400';
  }

  function getPriorityColor(priority) {
    return {
      'low': 'text-green-400', 'medium': 'text-yellow-400',
      'high': 'text-orange-400', 'critical': 'text-red-400'
    }[priority] || 'text-zinc-400';
  }

  function formatTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }

  // Group activities by date
  const groupedActivities = activities.reduce((groups, activity) => {
    const date = new Date(activity.timestamp).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(activity);
    return groups;
  }, {});

  return (
    <PageView>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">Activity Hub</h2>
            <p className="text-[12px] text-zinc-600 mt-0.5">Monitor, analyze, and manage all platform activities</p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-white/[0.05] rounded-lg p-1">
              {[
                { id: 'feed', label: 'Feed', icon: '📋' },
                { id: 'analytics', label: 'Analytics', icon: '📊' },
                { id: 'manage', label: 'Manage', icon: '⚙' }
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5
                    ${viewMode === mode.id
                      ? 'bg-violet-500/20 text-violet-300 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]'}`}
                >
                  <span>{mode.icon}</span>
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Real-time Toggle */}
            <button
              onClick={() => setRealTimeEnabled(!realTimeEnabled)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5
                ${realTimeEnabled
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-zinc-700 text-zinc-400'}`}
            >
              <span className="relative flex h-2 w-2">
                {realTimeEnabled && (
                  <>
                    <span className="animate-ping absolute inset-0 rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative rounded-full h-2 w-2 bg-emerald-500" />
                  </>
                )}
              </span>
              Live
            </button>

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5
                ${showFilters
                  ? 'bg-violet-500/20 text-violet-300'
                  : 'bg-white/[0.05] text-zinc-400 hover:text-zinc-200'}`}
            >
              <span>🔍</span>
              Filters
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-[#0e1017] rounded-xl border border-white/[0.07] p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Time Range */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-2">Time Range</label>
                    <select
                      value={filters.timeRange}
                      onChange={e => setFilters(prev => ({ ...prev, timeRange: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg text-sm text-zinc-200 bg-white/[0.05] border border-white/[0.08] focus:border-violet-500/50 outline-none"
                    >
                      <option value="1h">Last Hour</option>
                      <option value="6h">Last 6 Hours</option>
                      <option value="24h">Last 24 Hours</option>
                      <option value="7d">Last 7 Days</option>
                      <option value="30d">Last 30 Days</option>
                      <option value="all">All Time</option>
                      <option value="custom">Custom Range</option>
                    </select>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-2">Category</label>
                    <select
                      value={filters.category}
                      onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg text-sm text-zinc-200 bg-white/[0.05] border border-white/[0.08] focus:border-violet-500/50 outline-none"
                    >
                      <option value="all">All Categories</option>
                      <option value="project">Project</option>
                      <option value="user">User</option>
                      <option value="system">System</option>
                      <option value="security">Security</option>
                    </select>
                  </div>

                  {/* Action */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-2">Action</label>
                    <select
                      value={filters.action}
                      onChange={e => setFilters(prev => ({ ...prev, action: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg text-sm text-zinc-200 bg-white/[0.05] border border-white/[0.08] focus:border-violet-500/50 outline-none"
                    >
                      <option value="all">All Actions</option>
                      <option value="created_project">Created Project</option>
                      <option value="joined_project">Joined Project</option>
                      <option value="sent_message">Sent Message</option>
                      <option value="ai_chat">AI Chat</option>
                      <option value="login">Login</option>
                      <option value="logout">Logout</option>
                    </select>
                  </div>

                  {/* Project */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-2">Project</label>
                    <select
                      value={filters.project}
                      onChange={e => setFilters(prev => ({ ...prev, project: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg text-sm text-zinc-200 bg-white/[0.05] border border-white/[0.08] focus:border-violet-500/50 outline-none"
                    >
                      <option value="all">All Projects</option>
                      {projects.map(p => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Search */}
                  <div className="md:col-span-2 lg:col-span-4">
                    <label className="block text-xs font-semibold text-zinc-400 mb-2">Search</label>
                    <input
                      type="text"
                      value={filters.search}
                      onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      placeholder="Search activities..."
                      className="w-full px-3 py-2 rounded-lg text-sm text-zinc-200 bg-white/[0.05] border border-white/[0.08] focus:border-violet-500/50 outline-none placeholder-zinc-600"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content based on view mode */}
        {viewMode === 'feed' && (
          <div className="space-y-6">
            {/* Activity Feed */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="bg-[#0e1017] rounded-xl border border-white/[0.07] p-5 animate-pulse">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.06]" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-white/[0.06] rounded-lg w-3/4" />
                        <div className="h-3 bg-white/[0.04] rounded-lg w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-white/[0.08] text-center">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-lg font-bold text-zinc-300 mb-2">No activities yet</h3>
                <p className="text-sm text-zinc-600">Activities will appear here as they happen</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedActivities).map(([date, dayActivities]) => (
                  <div key={date}>
                    <h3 className="text-sm font-bold text-zinc-400 mb-3 uppercase tracking-wider">
                      {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </h3>
                    <div className="space-y-3">
                      {dayActivities.map(activity => (
                        <motion.div
                          key={activity._id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`bg-[#0e1017] rounded-xl border border-white/[0.07] hover:border-white/[0.12] p-5 transition-all cursor-pointer
                            ${activity.isRead ? 'opacity-60' : ''}`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg
                              ${activity.isRead ? 'bg-zinc-700' : 'bg-violet-500/10'}`}>
                              {getActivityIcon(activity.action)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-sm font-bold ${getActivityColor(activity.action)}`}>
                                  {activity.user?.displayName || activity.user?.email || 'Unknown User'}
                                </span>
                                <span className="text-xs text-zinc-500">•</span>
                                <span className="text-xs text-zinc-500">{formatTimeAgo(activity.timestamp)}</span>
                                {activity.priority && (
                                  <>
                                    <span className="text-xs text-zinc-500">•</span>
                                    <span className={`text-xs font-semibold ${getPriorityColor(activity.priority)}`}>
                                      {activity.priority}
                                    </span>
                                  </>
                                )}
                              </div>
                              <p className="text-sm text-zinc-300 leading-relaxed mb-2">
                                {activity.description}
                              </p>
                              {activity.metadata && (
                                <div className="text-xs text-zinc-500 font-mono bg-white/[0.02] rounded-lg p-2">
                                  {JSON.stringify(activity.metadata, null, 2)}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {viewMode === 'analytics' && (
          <div className="space-y-6">
            {/* Analytics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Activities', value: stats.totalActivities || 0, icon: '📊', color: 'text-blue-400' },
                { label: 'Active Users', value: stats.activeUsers || 0, icon: '👥', color: 'text-emerald-400' },
                { label: 'Projects Involved', value: stats.projectsInvolved || 0, icon: '📁', color: 'text-violet-400' },
                { label: 'Avg per Day', value: stats.avgPerDay || 0, icon: '📈', color: 'text-amber-400' }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-[#0e1017] rounded-xl border border-white/[0.07] p-6"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{stat.icon}</span>
                    <span className={`text-lg font-bold ${stat.color}`}>{stat.value}</span>
                  </div>
                  <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Category Breakdown */}
            {stats.categoriesBreakdown && (
              <div className="bg-[#0e1017] rounded-xl border border-white/[0.07] p-6">
                <h3 className="text-lg font-bold text-zinc-100 mb-4">Activity Categories</h3>
                <div className="space-y-3">
                  {Object.entries(stats.categoriesBreakdown).map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm text-zinc-300 capitalize">{category}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-white/[0.1] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                            style={{
                              width: `${(count / Math.max(...Object.values(stats.categoriesBreakdown))) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-sm text-zinc-400 w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activity Trends Chart Placeholder */}
            <div className="bg-[#0e1017] rounded-xl border border-white/[0.07] p-6">
              <h3 className="text-lg font-bold text-zinc-100 mb-4">Activity Trends</h3>
              <div className="h-64 flex items-center justify-center text-zinc-500">
                <div className="text-center">
                  <div className="text-4xl mb-2">📈</div>
                  <p>Chart visualization would go here</p>
                  <p className="text-xs">Integration with Chart.js or similar library</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'manage' && (
          <div className="space-y-6">
            {/* Management Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => setShowExportModal(true)}
                className="p-6 rounded-xl border border-white/[0.07] bg-[#0e1017] hover:bg-[#13161f] hover:border-white/[0.12] transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">
                  📤
                </div>
                <h3 className="text-[14px] font-bold text-zinc-100 mb-1">Export Activities</h3>
                <p className="text-[12px] text-zinc-500">Download activities as CSV for analysis</p>
              </button>

              <button
                onClick={handleMarkAsRead}
                disabled={selectedActivities.length === 0}
                className="p-6 rounded-xl border border-white/[0.07] bg-[#0e1017] hover:bg-[#13161f] hover:border-white/[0.12] transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">
                  ✓
                </div>
                <h3 className="text-[14px] font-bold text-zinc-100 mb-1">Mark as Read</h3>
                <p className="text-[12px] text-zinc-500">Mark selected activities as read</p>
              </button>

              <button
                onClick={handleDeleteActivities}
                disabled={selectedActivities.length === 0}
                className="p-6 rounded-xl border border-white/[0.07] bg-[#0e1017] hover:bg-[#13161f] hover:border-white/[0.12] transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">
                  🗑
                </div>
                <h3 className="text-[14px] font-bold text-zinc-100 mb-1">Delete Activities</h3>
                <p className="text-[12px] text-zinc-500">Permanently delete selected activities</p>
              </button>
            </div>

            {/* Activity Templates */}
            <div className="bg-[#0e1017] rounded-xl border border-white/[0.07] p-6">
              <h3 className="text-lg font-bold text-zinc-100 mb-4">Activity Templates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Project Milestone', action: 'milestone_reached', category: 'project' },
                  { name: 'Task Completed', action: 'task_completed', category: 'management' },
                  { name: 'Code Review', action: 'comment_added', category: 'development' },
                  { name: 'File Upload', action: 'file_uploaded', category: 'management' }
                ].map((template, i) => (
                  <div key={i} className="p-4 rounded-lg border border-white/[0.08] bg-white/[0.02]">
                    <h4 className="text-sm font-semibold text-zinc-100 mb-1">{template.name}</h4>
                    <p className="text-xs text-zinc-500 mb-2">{template.category} • {template.action}</p>
                    <button className="text-xs text-violet-400 hover:text-violet-300">
                      Use Template →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Export Modal */}
        <AnimatePresence>
          {showExportModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
              onClick={e => e.target === e.currentTarget && setShowExportModal(false)}
            >
              <motion.div
                initial={{ scale: 0.94, opacity: 0, y: 16 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.94, opacity: 0, y: 16 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="w-full max-w-md rounded-2xl border border-white/[0.09] bg-[#0e1017] shadow-2xl overflow-hidden"
              >
                <div className="px-6 pt-5 pb-4 border-b border-white/[0.06] flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-zinc-100 tracking-tight">Export Activities</h2>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Download filtered activities as CSV</p>
                  </div>
                  <button onClick={() => setShowExportModal(false)} className="w-8 h-8 rounded-lg border border-white/[0.08] hover:bg-white/[0.05] flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-all">✕</button>
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-sm text-zinc-300">
                    Export {activities.length} activities with current filters applied.
                  </p>
                  <div className="flex gap-3">
                    <button onClick={() => setShowExportModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-zinc-400 border border-white/[0.08] hover:border-white/[0.15] hover:text-zinc-200 hover:bg-white/[0.04] transition-all">Cancel</button>
                    <button onClick={handleExport} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 shadow-lg shadow-emerald-500/20 transition-all">Export CSV</button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageView>
  );
}

export default ActivityView;