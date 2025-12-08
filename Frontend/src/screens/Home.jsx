import React, { useContext, useState, useRef, useEffect } from "react";
import { UserContext } from "../context/user.context";
import axios from "../config/axios";
import { useNavigate } from "react-router-dom";
import Dashboard from "../components/Dashboard";

const Home = () => {
  const { user } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState(null);
  const [project, setProject] = useState([]);
  const [showAIDemo, setShowAIDemo] = useState(false);
  const [showChatDemo, setShowChatDemo] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiHistory, setAiHistory] = useState([]);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(['You', 'Alice', 'Bob', 'Charlie']);
  const projectNameRef = useRef(null);
  const navigate = useNavigate();

  function createProject(e) {
    axios
      .post("/projects/create", {
        name: projectName,
      })
      .then((res) => {
        console.log(res);
        setIsModalOpen(false);
      })
      .catch((error) => {
        console.log(error);
      });

    if (e && e.preventDefault) e.preventDefault();
    const name = projectName.trim();
    if (!name) {
      // simple validation - focus the input
      projectNameRef.current?.focus();
      return;
    }
    console.log("Creating project:", name);
    // placeholder: call API/service here
    setIsModalOpen(false);
    setProjectName("");
  }

  const handleAIDemo = async () => {
    if (!aiInput.trim()) return;
    
    setAiLoading(true);
    const currentInput = aiInput;
    setAiInput('');
    
    // Add to history
    setAiHistory(prev => [...prev, { type: 'user', text: currentInput, time: new Date().toLocaleTimeString() }]);
    
    // Simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const responses = {
      'create a react component': 'Here\'s a React component:\n\n```jsx\nfunction MyComponent() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div className="component">\n      <h1>Counter: {count}</h1>\n      <button onClick={() => setCount(count + 1)}>\n        Increment\n      </button>\n    </div>\n  );\n}\n\nexport default MyComponent;\n```',
      'help with css': 'Here are advanced CSS techniques:\n\n```css\n/* Modern CSS Grid Layout */\n.grid-container {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));\n  gap: 2rem;\n}\n\n/* Glass Morphism Effect */\n.glass {\n  background: rgba(255, 255, 255, 0.1);\n  backdrop-filter: blur(10px);\n  border: 1px solid rgba(255, 255, 255, 0.2);\n}\n```',
      'javascript function': 'Here\'s an advanced JavaScript function:\n\n```javascript\n// Async function with error handling\nasync function fetchUserData(userId) {\n  try {\n    const response = await fetch(`/api/users/${userId}`);\n    if (!response.ok) throw new Error(\'User not found\');\n    \n    const userData = await response.json();\n    return userData;\n  } catch (error) {\n    console.error(\'Error fetching user:\', error);\n    return null;\n  }\n}\n```',
      'api design': 'RESTful API Design Best Practices:\n\n```javascript\n// Express.js API Routes\napp.get(\'/api/users\', getAllUsers);\napp.get(\'/api/users/:id\', getUserById);\napp.post(\'/api/users\', createUser);\napp.put(\'/api/users/:id\', updateUser);\napp.delete(\'/api/users/:id\', deleteUser);\n\n// Response format\n{\n  "success": true,\n  "data": {...},\n  "message": "Operation successful"\n}\n```',
      'database query': 'MongoDB Query Examples:\n\n```javascript\n// Find with conditions\nconst users = await User.find({\n  age: { $gte: 18 },\n  status: \'active\'\n}).populate(\'profile\');\n\n// Aggregation pipeline\nconst stats = await User.aggregate([\n  { $match: { createdAt: { $gte: new Date(\'2024-01-01\') } } },\n  { $group: { _id: \'$department\', count: { $sum: 1 } } }\n]);\n```'
    };
    
    const response = responses[currentInput.toLowerCase()] || `I can help you with "${currentInput}"! Here are some suggestions:\n\n• **Code Generation**: "create a react component"\n• **Styling Help**: "help with css"\n• **Functions**: "javascript function"\n• **Backend**: "api design" or "database query"\n\n💡 **Pro Tip**: Be specific about what you need, and I\'ll provide detailed code examples!`;
    
    setAiHistory(prev => [...prev, { type: 'ai', text: response, time: new Date().toLocaleTimeString() }]);
    setAiLoading(false);
  };
  
  const handleChatDemo = async () => {
    if (!chatMessage.trim()) return;
    
    const newMessage = {
      text: chatMessage,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      user: 'You',
      avatar: (user?.name || 'U')[0].toUpperCase()
    };
    
    setChatMessages(prev => [...prev, newMessage]);
    setChatMessage('');
    
    // Simulate other users typing and responding
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const responses = [
      { text: "That's a great idea! 👍", user: 'Alice', avatar: 'A' },
      { text: "I agree! Let's implement this feature.", user: 'Bob', avatar: 'B' },
      { text: "Sounds good to me! When do we start?", user: 'Charlie', avatar: 'C' },
      { text: "Perfect! I'll create the documentation.", user: 'Alice', avatar: 'A' },
      { text: "Let me know if you need any help with the backend.", user: 'Bob', avatar: 'B' }
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    const botMessage = {
      ...randomResponse,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
    
    setChatMessages(prev => [...prev, botMessage]);
    setIsTyping(false);
  };

  useEffect(() => {
    axios
      .get("/projects/all")
      .then((res) => {
        console.log(res.data.projects);
        setProject(res.data.projects);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <nav className="bg-white/10 backdrop-blur-2xl border-b border-white/20 shadow-2xl sticky top-0 z-50 relative">
        {/* Glass Background Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
        <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            {/* Logo Section */}
            <div className="flex items-center gap-4 group">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl ring-2 ring-white/20 group-hover:scale-105 transition-all duration-300">
                <i className="ri-brain-fill text-white text-2xl group-hover:rotate-12 transition-transform duration-300"></i>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Innovative AI
                </h1>
                <p className="text-xs text-gray-600/80 font-medium">Full Stack Development Platform</p>
              </div>
            </div>



            {/* User Section */}
            <div className="flex items-center gap-4">
              {/* User Info */}
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-2 shadow-lg hover:bg-white/20 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold shadow-xl ring-2 ring-white/30 hover:scale-105 transition-transform duration-300">
                  {(user?.name || user?.email || 'U')[0].toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-bold text-gray-900">
                    {user?.name || user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-gray-600/80 font-medium">{user?.email}</p>
                </div>
              </div>

              {/* Logout Button */}
              <button 
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = '/login';
                }}
                className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-500/20 to-pink-500/20 backdrop-blur-xl border border-red-300/30 text-red-700 rounded-2xl hover:from-red-500/30 hover:to-pink-500/30 hover:border-red-400/50 transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:scale-105"
              >
                <i className="ri-logout-box-line text-lg group-hover:translate-x-1 transition-transform duration-300"></i>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Hero Section */}
      <div className="relative py-16 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-purple-100/30 to-pink-100/50"></div>
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-2xl ring-4 ring-white/50">
                {(user?.name || user?.email || 'U')[0].toUpperCase()}
              </div>
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Welcome back, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {user?.name || user?.email?.split('@')[0] || 'Developer'}
              </span>!
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Build amazing projects with AI-powered assistance, real-time collaboration, and integrated development tools.
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30 hover:bg-white/80 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <i className="ri-folder-3-fill text-white text-2xl"></i>
                </div>
                <div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{project.length}</h3>
                  <p className="text-gray-600 font-medium">Active Projects</p>
                </div>
              </div>
            </div>
            
            <div className="group bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30 hover:bg-white/80 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <i className="ri-robot-2-fill text-white text-2xl"></i>
                </div>
                <div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">AI</h3>
                  <p className="text-gray-600 font-medium">Assistant Ready</p>
                </div>
              </div>
            </div>
            
            <div className="group bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30 hover:bg-white/80 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <i className="ri-team-fill text-white text-2xl"></i>
                </div>
                <div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    {project.reduce((total, p) => total + (p.users?.length || 0), 0)}
                  </h3>
                  <p className="text-gray-600 font-medium">Collaborators</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Projects Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Projects</h2>
              <p className="text-gray-600">Manage and collaborate on your development projects</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
            >
              <i className="ri-add-line text-lg"></i>
              <span>New Project</span>
            </button>
          </div>
          
          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {project.length === 0 ? (
              <div className="col-span-full">
                <div className="text-center py-12 bg-white/50 rounded-2xl border-2 border-dashed border-gray-300">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-folder-add-line text-2xl text-gray-400"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No projects yet</h3>
                  <p className="text-gray-500 mb-4">Create your first project to get started</p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg font-medium"
                  >
                    Create Project
                  </button>
                </div>
              </div>
            ) : (
              project.map((proj) => (
                <div
                  key={proj._id}
                  onClick={() => {
                    navigate(`/project/${proj._id}`, {
                      state: { project: proj },
                    });
                  }}
                  className="group cursor-pointer bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30 hover:bg-white/80 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-3xl hover:border-blue-300/50"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <i className="ri-folder-3-fill text-white text-2xl"></i>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <i className="ri-arrow-right-line text-blue-500 text-2xl"></i>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                    {proj.name}
                  </h3>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                      <i className="ri-team-fill text-blue-500"></i>
                      <span className="font-medium">{proj.users?.length || 0} collaborators</span>
                    </div>
                    <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-medium text-green-700">Active</span>
                    </div>
                  </div>
                  
                  {/* Enhanced Collaborators Avatars */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-3">
                        {proj.users?.slice(0, 4).map((projectUser, index) => {
                          const colors = [
                            'from-blue-500 to-cyan-500',
                            'from-purple-500 to-pink-500', 
                            'from-emerald-500 to-teal-500',
                            'from-orange-500 to-red-500'
                          ];
                          return (
                            <div
                              key={index}
                              className={`w-10 h-10 bg-gradient-to-r ${colors[index % colors.length]} rounded-full flex items-center justify-center text-white text-sm font-bold border-3 border-white shadow-lg hover:scale-110 transition-transform duration-200 relative group/avatar`}
                              title={projectUser.name || projectUser.email}
                            >
                              {(projectUser.name || projectUser.email || 'U')[0].toUpperCase()}
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                {projectUser.name || projectUser.email?.split('@')[0] || 'User'}
                              </div>
                            </div>
                          );
                        })}
                        {(proj.users?.length || 0) > 4 && (
                          <div className="w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white text-sm font-bold border-3 border-white shadow-lg">
                            +{(proj.users?.length || 0) - 4}
                          </div>
                        )}
                      </div>
                      {(proj.users?.length || 0) === 0 && (
                        <div className="flex items-center gap-2 text-gray-500">
                          <i className="ri-user-add-line"></i>
                          <span className="text-sm font-medium">No collaborators yet</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                        Open Project
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* AI Assistant Card */}
          <div className="group bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-2xl hover:bg-white/80 transition-all duration-500 hover:scale-105 cursor-pointer" onClick={() => setShowAIDemo(true)}>
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <i className="ri-robot-2-line text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">AI Assistant</h3>
            <p className="text-gray-600 leading-relaxed mb-4">Intelligent code generation and help with advanced AI capabilities</p>
            <div className="flex items-center gap-2 text-purple-600 font-medium">
              <i className="ri-play-circle-line"></i>
              <span>Try AI Assistant</span>
            </div>
          </div>
          
          {/* Real-time Chat Card */}
          <div className="group bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-2xl hover:bg-white/80 transition-all duration-500 hover:scale-105 cursor-pointer" onClick={() => setShowChatDemo(true)}>
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <i className="ri-message-3-line text-white text-2xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:bg-gradient-to-r group-hover:from-emerald-600 group-hover:to-teal-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">Real-time Chat</h3>
            <p className="text-gray-600 leading-relaxed mb-4">Collaborate with team members instantly with seamless communication</p>
            <div className="flex items-center gap-2 text-emerald-600 font-medium">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span>Start Chatting</span>
            </div>
          </div>
        </div>
      </main>

      {/* Modern Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
            aria-hidden="true"
          />

          {/* modal panel */}
          <div className="relative w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20">
            <form onSubmit={createProject}>
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-3xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <i className="ri-folder-add-line text-xl"></i>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Create New Project</h3>
                      <p className="text-blue-100 text-sm">Start building something amazing</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
                    aria-label="Close modal"
                  >
                    <i className="ri-close-fill text-xl"></i>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700 mb-2 block">Project Name</span>
                  <input
                    ref={projectNameRef}
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm placeholder-gray-500 text-gray-800"
                    placeholder="Enter project name..."
                    aria-label="Project name"
                  />
                </label>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                  >
                    Create Project
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* AI Assistant Demo Modal */}
      {showAIDemo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAIDemo(false)}></div>
          <div className="relative w-full max-w-2xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-3xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <i className="ri-robot-2-fill text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">AI Assistant Demo</h3>
                    <p className="text-purple-100 text-sm">Try our intelligent AI assistant</p>
                  </div>
                </div>
                <button onClick={() => setShowAIDemo(false)} className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200">
                  <i className="ri-close-fill text-xl"></i>
                </button>
              </div>
            </div>
            <div className="p-6">
              {/* Quick Suggestions */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-600 mb-2">Quick suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {['create a react component', 'help with css', 'javascript function', 'api design', 'database query'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setAiInput(suggestion)}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Chat History */}
              <div className="h-64 bg-gray-50 rounded-xl p-4 mb-4 overflow-y-auto">
                {aiHistory.length === 0 ? (
                  <div className="text-center text-gray-500 mt-20">
                    <i className="ri-robot-2-line text-4xl mb-2"></i>
                    <p>Ask me anything about coding!</p>
                  </div>
                ) : (
                  aiHistory.map((item, index) => (
                    <div key={index} className={`mb-4 ${item.type === 'user' ? 'text-right' : 'text-left'}`}>
                      <div className={`inline-block max-w-[80%] p-3 rounded-xl ${
                        item.type === 'user' 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-white border border-gray-200'
                      }`}>
                        <div className="text-xs opacity-70 mb-1">
                          {item.type === 'user' ? 'You' : '🤖 AI Assistant'} • {item.time}
                        </div>
                        <div className="whitespace-pre-wrap text-sm">{item.text}</div>
                      </div>
                    </div>
                  ))
                )}
                {aiLoading && (
                  <div className="text-left mb-4">
                    <div className="inline-block bg-white border border-gray-200 p-3 rounded-xl">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        <span className="text-sm text-gray-600">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <input
                  className="flex-1 px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
                  placeholder="Ask AI anything..."
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !aiLoading && handleAIDemo()}
                  disabled={aiLoading}
                />
                <button
                  onClick={handleAIDemo}
                  disabled={aiLoading || !aiInput.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-medium disabled:opacity-50"
                >
                  {aiLoading ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-send-plane-2-fill"></i>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Chat Demo Modal */}
      {showChatDemo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowChatDemo(false)}></div>
          <div className="relative w-full max-w-2xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-t-3xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <i className="ri-message-3-fill text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Real-time Chat Demo</h3>
                    <p className="text-emerald-100 text-sm">Experience instant messaging</p>
                  </div>
                </div>
                <button onClick={() => setShowChatDemo(false)} className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200">
                  <i className="ri-close-fill text-xl"></i>
                </button>
              </div>
            </div>
            <div className="p-6">
              {/* Online Users */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-600 mb-2">Online now ({onlineUsers.length}):</p>
                <div className="flex gap-2">
                  {onlineUsers.map((userName, index) => (
                    <div key={index} className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>{userName}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="h-64 bg-gray-50 rounded-xl p-4 mb-4 overflow-y-auto">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-16">
                    <i className="ri-chat-3-line text-4xl mb-2"></i>
                    <p>Start a conversation with your team!</p>
                    <p className="text-xs mt-1">Try saying "Hello everyone!"</p>
                  </div>
                ) : (
                  chatMessages.map((msg, index) => (
                    <div key={index} className={`mb-3 ${msg.user === 'You' ? 'text-right' : 'text-left'}`}>
                      <div className="flex items-center gap-2 mb-1 justify-start">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                          msg.user === 'You' ? 'bg-gradient-to-r from-blue-500 to-purple-500' :
                          msg.user === 'Alice' ? 'bg-gradient-to-r from-pink-500 to-rose-500' :
                          msg.user === 'Bob' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                          'bg-gradient-to-r from-orange-500 to-red-500'
                        }`}>
                          {msg.avatar}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{msg.user}</span>
                        <span className="text-xs text-gray-500">{msg.time}</span>
                      </div>
                      <div className={`inline-block px-3 py-2 rounded-lg ml-8 max-w-[80%] ${
                        msg.user === 'You' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white border border-gray-200 text-gray-800'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
                {isTyping && (
                  <div className="text-left mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        <i className="ri-more-fill"></i>
                      </div>
                      <span className="text-sm font-medium text-gray-700">Someone</span>
                    </div>
                    <div className="bg-white border border-gray-200 px-3 py-2 rounded-lg ml-8 inline-block">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <input
                  className="flex-1 px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-gray-500"
                  placeholder="Type your message..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isTyping && handleChatDemo()}
                  disabled={isTyping}
                />
                <button
                  onClick={handleChatDemo}
                  disabled={isTyping || !chatMessage.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 font-medium disabled:opacity-50"
                >
                  {isTyping ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-send-plane-2-fill"></i>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Settings Button - Bottom Left */}
      <div className="fixed bottom-6 left-6 z-40">
        <a href="/settings" className="group flex items-center gap-3 px-6 py-4 bg-white/10 backdrop-blur-2xl border border-white/30 rounded-2xl text-gray-700 hover:bg-white/20 hover:text-purple-600 transition-all duration-300 font-medium shadow-2xl hover:shadow-3xl hover:scale-105">
          <i className="ri-settings-3-line text-xl group-hover:rotate-90 transition-transform duration-300"></i>
          <span className="font-semibold">Settings</span>
        </a>
      </div>
    </div>
  );
};

export default Home;
