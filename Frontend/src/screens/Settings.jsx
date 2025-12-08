import React, { useState, useContext } from 'react';
import { UserContext } from '../context/user.context';

const Settings = () => {
    const { user, setUser } = useContext(UserContext);
    const [activeTab, setActiveTab] = useState('profile');
    const [settings, setSettings] = useState({
        theme: 'light',
        fontSize: 14,
        autoSave: true,
        notifications: true,
        aiAssistance: true
    });

    const tabs = [
        { id: 'profile', name: 'Profile', icon: 'ri-user-fill' },
        { id: 'preferences', name: 'Preferences', icon: 'ri-settings-fill' },
        { id: 'ai', name: 'AI Settings', icon: 'ri-robot-fill' },
        { id: 'security', name: 'Security', icon: 'ri-shield-fill' }
    ];

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const saveSettings = () => {
        // Mock save functionality
        localStorage.setItem('userSettings', JSON.stringify(settings));
        alert('Settings saved successfully!');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto p-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-600 mt-2">Manage your account and application preferences</p>
                </div>

                <div className="bg-white rounded-lg shadow">
                    <div className="flex border-b border-gray-200">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center px-6 py-4 text-sm font-medium ${
                                    activeTab === tab.id
                                        ? 'border-b-2 border-blue-500 text-blue-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <i className={`${tab.icon} mr-2`}></i>
                                {tab.name}
                            </button>
                        ))}
                    </div>

                    <div className="p-6">
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={user?.email || ''}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                                            disabled
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Display Name
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Enter your display name"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Bio
                                    </label>
                                    <textarea
                                        rows={4}
                                        placeholder="Tell us about yourself"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'preferences' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-900">Application Preferences</h2>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900">Theme</h3>
                                            <p className="text-sm text-gray-500">Choose your preferred theme</p>
                                        </div>
                                        <select
                                            value={settings.theme}
                                            onChange={(e) => handleSettingChange('theme', e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="light">Light</option>
                                            <option value="dark">Dark</option>
                                            <option value="auto">Auto</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900">Font Size</h3>
                                            <p className="text-sm text-gray-500">Editor font size</p>
                                        </div>
                                        <select
                                            value={settings.fontSize}
                                            onChange={(e) => handleSettingChange('fontSize', Number(e.target.value))}
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value={12}>12px</option>
                                            <option value={14}>14px</option>
                                            <option value={16}>16px</option>
                                            <option value={18}>18px</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900">Auto Save</h3>
                                            <p className="text-sm text-gray-500">Automatically save changes</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.autoSave}
                                                onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'ai' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-900">AI Assistant Settings</h2>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900">AI Assistance</h3>
                                            <p className="text-sm text-gray-500">Enable AI-powered code suggestions</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings.aiAssistance}
                                                onChange={(e) => handleSettingChange('aiAssistance', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="p-4 bg-blue-50 rounded-lg">
                                        <h4 className="text-sm font-medium text-blue-900 mb-2">AI Features</h4>
                                        <ul className="text-sm text-blue-800 space-y-1">
                                            <li>• Code completion and suggestions</li>
                                            <li>• Error detection and fixes</li>
                                            <li>• Code optimization recommendations</li>
                                            <li>• Natural language to code conversion</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
                                
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900 mb-2">Change Password</h3>
                                        <div className="space-y-3">
                                            <input
                                                type="password"
                                                placeholder="Current password"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <input
                                                type="password"
                                                placeholder="New password"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <input
                                                type="password"
                                                placeholder="Confirm new password"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                                                Update Password
                                            </button>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4">
                                        <h3 className="text-sm font-medium text-gray-900 mb-2">Two-Factor Authentication</h3>
                                        <p className="text-sm text-gray-500 mb-3">Add an extra layer of security to your account</p>
                                        <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
                                            Enable 2FA
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <div className="flex justify-end space-x-3">
                                <button className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                                    Cancel
                                </button>
                                <button 
                                    onClick={saveSettings}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;