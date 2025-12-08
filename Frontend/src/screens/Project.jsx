import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from "../config/axios";
import { UserContext } from "../context/user.context";
import AIChat from "../components/AIChat";

const Project = () => {
  const { user } = useContext(UserContext);
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState([]);
  const [users, setUsers] = useState([]);
  const [showAIChat, setShowAIChat] = useState(false);
  const [projectData, setProjectData] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [projectMessages, setProjectMessages] = useState([]);
  const [showDeleteOptions, setShowDeleteOptions] = useState({});
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);
  const [intervalId, setIntervalId] = useState(null);

  const handleUserClick = (id) => {
    setSelectedUserId((prevSelectedUserId) => {
      const newSelectedUserId = new Set(prevSelectedUserId);
      if (newSelectedUserId.has(id)) {
        newSelectedUserId.delete(id);
      } else {
        newSelectedUserId.add(id);
      }
      return newSelectedUserId;
    });
  };

  function addCollaborators() {
    const currentProjectId = location.state?.project?._id || projectId;
    
    if (!currentProjectId) {
      alert("Project ID not found. Please go back to home and select project again.");
      return;
    }

    if (selectedUserId.size === 0) {
      alert("Please select at least one user");
      return;
    }

    axios.put("/projects/add-user", {
      projectId: currentProjectId,
      users: Array.from(selectedUserId)
    }).then((res) => {
      console.log("Collaborators added:", res.data);
      setIsModalOpen(false);
      setSelectedUserId(new Set());
      fetchProjectData();
      alert("Collaborators added successfully!");
    }).catch((err) => {
      console.error("Error adding collaborators:", err);
      alert("Failed to add collaborators");
    });
  }

  const sendChatMessage = async () => {
    if (!chatMessage.trim()) return;
    
    const currentProjectId = location.state?.project?._id || projectId;
    if (!currentProjectId) return;
    
    console.log('Sending message:', {
      projectId: currentProjectId,
      message: chatMessage,
      userEmail: user?.email,
      userName: user?.name
    });
    
    try {
      const response = await axios.post('/project-chat/simple-send', {
        projectId: currentProjectId,
        message: chatMessage,
        userEmail: user?.email || 'akabhi0736@gmail.com' // Fallback email
      });
      
      console.log('Message sent successfully:', response.data);
      setChatMessage('');
      fetchProjectMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message: ' + (error.response?.data?.error || error.message));
    }
  };

  const fetchProjectMessages = async () => {
    const currentProjectId = location.state?.project?._id || projectId;
    if (!currentProjectId) return;
    
    try {
      const response = await axios.get(`/project-chat/simple-messages/${currentProjectId}`);
      const messages = response.data.messages || [];
      console.log('Fetched messages:', messages.length, 'messages');
      setProjectMessages(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const deleteMessage = async (messageId) => {
    if (!confirm('Delete this message?')) return;
    
    try {
      const response = await axios.delete(`/project-chat/simple-delete/${messageId}`);
      console.log('Delete response:', response.data);
      
      setProjectMessages(prev => prev.filter(msg => msg._id !== messageId));
      setShowDeleteOptions({});
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message: ' + (error.response?.data?.error || error.message));
    }
  };

  const toggleDeleteOption = (messageId) => {
    setShowDeleteOptions(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  const toggleRealTime = () => {
    setIsRealTimeEnabled(prev => !prev);
  };

  const clearAllMessages = async () => {
    if (!confirm('Are you sure you want to clear all messages? This action cannot be undone.')) return;
    
    const currentProjectId = location.state?.project?._id || projectId;
    if (!currentProjectId) {
      alert('Project ID not found');
      return;
    }
    
    try {
      const response = await axios.delete(`/project-chat/simple-clear/${currentProjectId}`);
      console.log('Clear response:', response.data);
      setProjectMessages([]);
      alert('All messages cleared successfully!');
    } catch (error) {
      console.error('Error clearing messages:', error);
      alert('Failed to clear messages: ' + (error.response?.data?.error || error.message));
    }
  };

  const fetchProjectData = async () => {
    const currentProjectId = location.state?.project?._id || projectId;
    
    if (currentProjectId) {
      try {
        const response = await axios.get(`/projects/get-project/${currentProjectId}`);
        setProjectData(response.data.project);
      } catch (error) {
        console.error('Error fetching project data:', error);
      }
    }
  };

  useEffect(() => {
    fetchProjectData();
    fetchProjectMessages();
    
    axios.get("/users/all")
      .then((res) => {
        setUsers(res.data.users);
      })
      .catch((err) => {
        console.log(err);
      });
    
    const handleClickOutside = (e) => {
      if (!e.target.closest('.message-options')) {
        setShowDeleteOptions({});
      }
    };
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Separate useEffect for real-time polling
  useEffect(() => {
    let interval;
    if (isRealTimeEnabled) {
      interval = setInterval(() => {
        fetchProjectMessages();
      }, 1000); // Every 1 second for real-time
      setIntervalId(interval);
    } else {
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRealTimeEnabled]);

  const location = useLocation();

  return (
    <main className="h-screen w-screen flex bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Main Project Workspace */}
      <section className="flex-1 relative flex flex-col h-screen">
        {/* Header */}
        <header className="bg-white/10 backdrop-blur-2xl border-b border-white/20 shadow-2xl relative">
          {/* Glass Background Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
          <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl"></div>
          
          <div className="relative flex justify-between items-center p-6">
            <div className="flex items-center gap-6">
              {/* Back to Home Button */}
              <button 
                onClick={() => navigate('/')}
                className="group flex items-center gap-3 px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-gray-700 hover:bg-white/20 hover:text-blue-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:scale-105"
              >
                <i className="ri-arrow-left-line text-lg group-hover:-translate-x-1 transition-transform duration-300"></i>
                <span>Home</span>
              </button>
              
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl ring-2 ring-white/20">
                  <i className="ri-folder-3-fill text-white text-2xl"></i>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">{projectData?.name || 'Project Workspace'}</h1>
                  <p className="text-sm text-gray-600/80 flex items-center gap-2 font-medium">
                    <i className="ri-team-fill text-blue-500"></i>
                    {projectData?.users?.length || 0} collaborators
                    <span className="mx-2 text-gray-400">•</span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-600">Active now</span>
                    </div>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-xl border border-emerald-300/30 text-emerald-700 rounded-2xl hover:from-emerald-500/30 hover:to-teal-500/30 hover:border-emerald-400/50 transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:scale-105" 
                onClick={() => setIsModalOpen(true)}
              > 
                <i className="ri-user-add-fill text-lg group-hover:scale-110 transition-transform duration-300"></i>
                <span>Invite</span>
              </button>
              
              <button 
                className={`group flex items-center gap-3 px-6 py-3 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-medium ${
                  showAIChat 
                    ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 backdrop-blur-xl border border-purple-300/50 text-purple-700' 
                    : 'bg-white/10 backdrop-blur-xl border border-white/20 text-gray-700 hover:bg-white/20 hover:text-purple-600'
                }`}
                onClick={() => setShowAIChat(!showAIChat)}
              >
                <i className="ri-robot-2-fill text-lg group-hover:rotate-12 transition-transform duration-300"></i>
                <span>AI Assistant</span>
              </button>
              
              <button
                onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
                className="group flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 text-gray-700 rounded-2xl hover:bg-white/20 hover:text-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-medium"
              >
                <i className="ri-team-fill text-lg group-hover:scale-110 transition-transform duration-300"></i>
                <span>Team</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-white/20 via-blue-50/30 to-purple-50/20 backdrop-blur-sm">
          {/* Chat Controls */}
          <div className="px-6 py-4 bg-white/10 backdrop-blur-2xl border-b border-white/20 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleRealTime}
                    className={`flex items-center gap-3 px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 backdrop-blur-xl border ${
                      isRealTimeEnabled 
                        ? 'bg-green-500/20 text-green-700 border-green-300/30 hover:bg-green-500/30' 
                        : 'bg-white/10 text-gray-600 border-white/20 hover:bg-white/20'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${
                      isRealTimeEnabled ? 'bg-green-500 animate-pulse shadow-lg' : 'bg-gray-400'
                    }`}></div>
                    <span>{isRealTimeEnabled ? 'Real-time ON' : 'Real-time OFF'}</span>
                  </button>
                  
                  <button
                    onClick={fetchProjectMessages}
                    className="group flex items-center gap-3 px-4 py-2 bg-blue-500/20 text-blue-700 rounded-2xl text-sm font-medium hover:bg-blue-500/30 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 backdrop-blur-xl border border-blue-300/30"
                  >
                    <i className="ri-refresh-line group-hover:rotate-180 transition-transform duration-300"></i>
                    <span>Refresh</span>
                  </button>
                </div>
                
                <div className="px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
                  <span className="text-sm font-medium text-gray-700">{projectMessages.length} messages</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={clearAllMessages}
                  className="group flex items-center gap-3 px-4 py-2 bg-red-500/20 text-red-700 rounded-2xl text-sm font-medium hover:bg-red-500/30 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 backdrop-blur-xl border border-red-300/30"
                >
                  <i className="ri-delete-bin-line group-hover:scale-110 transition-transform duration-300"></i>
                  <span>Clear All</span>
                </button>
              </div>
            </div>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 p-4 overflow-hidden">
            <div className="h-full overflow-y-auto pr-2" style={{maxHeight: 'calc(100vh - 280px)'}}>
            {projectMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-8 rounded-3xl shadow-lg">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <i className="ri-chat-3-fill text-white text-3xl"></i>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">Welcome to Your Project!</h3>
                    <p className="text-gray-600 mb-6 max-w-md">Start collaborating with your team members. Share ideas, discuss features, and build amazing things together.</p>
                    <div className="flex gap-4 justify-center">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <i className="ri-message-3-fill text-blue-500"></i>
                        <span>Real-time messaging</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <i className="ri-robot-2-fill text-purple-500"></i>
                        <span>AI assistance</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {projectMessages.map((message) => (
                  <div 
                    key={message._id} 
                    className={`flex items-start gap-3 ${
                      message.sender?.email === user?.email ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    {/* User Avatar */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0 ${
                      message.message.startsWith('🤖 AI Assistant:')
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                        : message.message.startsWith('💬 Asked AI:')
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-400'
                        : message.sender?.email === user?.email 
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500' 
                        : 'bg-gradient-to-r from-gray-500 to-gray-600'
                    }`}>
                      {message.message.startsWith('🤖 AI Assistant:') 
                        ? <i className="ri-robot-2-fill"></i>
                        : message.message.startsWith('💬 Asked AI:') 
                        ? <i className="ri-question-fill"></i>
                        : <span>{(message.sender?.name || message.sender?.email || 'U')[0].toUpperCase()}</span>
                      }
                    </div>
                    
                    {/* Message Content */}
                    <div className={`max-w-md group relative`}>
                      {/* User Name and Time */}
                      <div className={`mb-1 ${
                        message.sender?.email === user?.email ? 'text-right' : 'text-left'
                      }`}>
                        <span className="font-semibold text-gray-800 text-sm">
                          {message.message.startsWith('🤖 AI Assistant:') 
                            ? 'AI Assistant' 
                            : message.message.startsWith('💬 Asked AI:') 
                            ? (message.sender?.name || message.sender?.email?.split('@')[0] || 'Unknown')
                            : (message.sender?.name || message.sender?.email?.split('@')[0] || 'Unknown')}
                        </span>
                        <span className="text-gray-500 text-xs ml-2">
                          {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: true})}
                        </span>
                      </div>
                      <div className={`px-4 py-3 rounded-2xl shadow-sm relative ${
                        message.message.startsWith('🤖 AI Assistant:')
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : message.message.startsWith('💬 Asked AI:')
                          ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-900 border border-yellow-200'
                          : message.sender?.email === user?.email 
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' 
                          : 'bg-gray-100 text-gray-800'
                      } ${message.sender?.email === user?.email ? 'rounded-br-sm' : 'rounded-bl-sm'}`}>
                        
                        {/* Message Options */}
                        <div className="message-options absolute -top-2 -right-2 flex gap-1">
                          {/* Copy Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(message.message);
                              alert('Message copied to clipboard!');
                            }}
                            className="w-6 h-6 bg-blue-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center hover:bg-blue-600 shadow-lg"
                          >
                            <i className="ri-file-copy-line text-xs"></i>
                          </button>
                          
                          {/* Delete Button - Only for own messages */}
                          {message.sender?.email === user?.email && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleDeleteOption(message._id);
                                }}
                                className="w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center hover:bg-red-600 shadow-lg"
                              >
                                <i className="ri-more-2-fill text-xs"></i>
                              </button>
                              {showDeleteOptions[message._id] && (
                                <div className="absolute top-8 right-0 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-20 min-w-[140px]">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteMessage(message._id);
                                    }}
                                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 text-sm flex items-center gap-2 font-medium"
                                  >
                                    <i className="ri-delete-bin-line"></i>
                                    Delete Message
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                        
                        <div className="text-sm leading-relaxed">
                          {message.message.includes('```') ? (
                            <div>
                              {message.message.split('```').map((part, index) => {
                                if (index % 2 === 1) {
                                  return (
                                    <pre key={index} className="bg-black/20 text-white p-3 rounded-lg mt-3 mb-3 overflow-x-auto text-xs border">
                                      <code>{part}</code>
                                    </pre>
                                  );
                                } else {
                                  return <div key={index} className="whitespace-pre-wrap">{part}</div>;
                                }
                              })}
                            </div>
                          ) : (
                            <div className="whitespace-pre-wrap">{message.message}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
          </div>
          
          {/* Message Input */}
          <div className="p-6 bg-white/10 backdrop-blur-2xl border-t border-white/20 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
            <div className="relative flex gap-4 items-end">
              <div className="flex-1 relative">
                <input
                  className="w-full px-6 py-4 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300/50 shadow-lg placeholder-gray-600 text-gray-800 font-medium"
                  type="text"
                  placeholder="Type your message..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                />
              </div>
              <button 
                className="group px-8 py-4 bg-gradient-to-r from-blue-500/30 to-purple-500/30 backdrop-blur-xl border border-blue-300/50 text-blue-700 rounded-2xl hover:from-blue-500/40 hover:to-purple-500/40 hover:border-blue-400/60 transition-all duration-300 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105 font-medium"
                onClick={sendChatMessage}
                disabled={!chatMessage.trim()}
              >
                <i className="ri-send-plane-2-fill text-lg group-hover:translate-x-1 transition-transform duration-300"></i>
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>

        {/* Team Panel */}
        <div
          className={`sidePanel w-full h-full flex flex-col bg-white/95 backdrop-blur-xl absolute transition-all duration-500 ease-in-out shadow-2xl ${
            isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
          } top-0 z-30 border-r border-white/20`}
        >
          <header className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
            <div className="flex justify-between items-center px-8 py-6">
              <div>
                <h2 className="text-xl font-bold">Team Members</h2>
                <p className="text-slate-300 text-sm">Project collaborators</p>
              </div>
              <button
                onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
                className="p-3 hover:bg-white/10 rounded-xl transition-all duration-200 hover:rotate-90"
              >
                <i className="ri-close-fill text-xl"></i>
              </button>
            </div>
          </header>

          <div className="flex-1 p-8 overflow-auto">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  Active Members
                </h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {projectData?.users?.length || 0} members
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              {projectData?.users?.map((user, index) => (
                <div key={user._id} className="group">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-white to-gray-50 rounded-2xl hover:from-blue-50 hover:to-purple-50 transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-100 hover:border-blue-200">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {(user.name || user.email)[0].toUpperCase()}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-lg">
                        {user.name || user.email.split('@')[0]}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">{user.email}</p>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-lg font-medium">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          Online
                        </span>
                        {index === 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-lg font-medium">
                            <i className="ri-crown-fill"></i>
                            Owner
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )) || (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-team-line text-3xl text-gray-400"></i>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">No team members yet</h4>
                  <p className="text-gray-500 mb-4">Invite collaborators to start working together</p>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg font-medium"
                  >
                    <i className="ri-user-add-fill mr-2"></i>
                    Invite Members
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* AI Chat Panel */}
      {showAIChat && (
        <section className="ai-chat w-96 h-screen bg-white/95 backdrop-blur-xl border-l border-white/20 shadow-2xl">
          <div className="h-full flex flex-col">
            <header className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <div className="flex justify-between items-center p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <i className="ri-robot-2-fill text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">AI Assistant</h3>
                    <p className="text-purple-100 text-sm">Your coding companion</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAIChat(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
                >
                  <i className="ri-close-fill text-xl"></i>
                </button>
              </div>
            </header>
            <div className="flex-1 bg-gradient-to-b from-purple-50 to-pink-50">
              <AIChat projectId={location?.state?.project?._id} />
            </div>
          </div>
        </section>
      )}

      {/* Invite Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-md shadow-2xl border border-white/20">
            <header className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-t-3xl">
              <div className="flex justify-between items-center p-6">
                <div>
                  <h2 className="text-xl font-bold">Invite Collaborators</h2>
                  <p className="text-emerald-100 text-sm">Add team members to your project</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
                >
                  <i className="ri-close-fill text-xl"></i>
                </button>
              </div>
            </header>
            
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Available Users</h3>
              </div>
              
              <div className="users-list space-y-3 mb-6 max-h-80 overflow-auto">
                {users.map((user) => (
                  <div
                    key={user._id}
                    className={`user cursor-pointer rounded-2xl p-4 transition-all duration-200 border-2 ${
                      Array.from(selectedUserId).indexOf(user._id) != -1
                        ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300 shadow-lg"
                        : "bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300"
                    } flex gap-3 items-center`}
                    onClick={() => handleUserClick(user._id)}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {(user.name || user.email)[0].toUpperCase()}
                      </div>
                      {Array.from(selectedUserId).indexOf(user._id) != -1 && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                          <i className="ri-check-fill text-white text-sm"></i>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">{user.name || user.email.split('@')[0]}</h4>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                onClick={addCollaborators}
                disabled={selectedUserId.size === 0}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <i className="ri-user-add-fill mr-2"></i>
                Add {selectedUserId.size} Collaborator{selectedUserId.size !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Project;