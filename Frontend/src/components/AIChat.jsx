import React, { useState, useRef, useEffect, useContext } from 'react';
import axios from '../config/axios';
import { UserContext } from '../context/user.context';

const AIChat = ({ projectId }) => {
    const { user } = useContext(UserContext);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            text: inputMessage,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        // Send user's AI question to project chat
        await axios.post('/project-chat/send', {
            projectId: projectId,
            message: `💬 Asked AI: ${inputMessage}`
        });

        try {
            const response = await axios.post('/ai/generate-response', {
                prompt: inputMessage,
                context: `Project ID: ${projectId}`
            });

            if (response.data.success) {
                const aiMessage = {
                    id: Date.now() + 1,
                    text: response.data.response,
                    sender: 'ai',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, aiMessage]);
                
                // Send AI response to project chat for all users to see
                await axios.post('/project-chat/send', {
                    projectId: projectId,
                    message: `🤖 AI Assistant:\n\n${response.data.response}`
                });
            } else {
                throw new Error(response.data.error);
            }
        } catch (error) {
            const errorMessage = {
                id: Date.now() + 1,
                text: 'Sorry, I encountered an error. Please try again.',
                sender: 'ai',
                timestamp: new Date(),
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const quickPrompts = [
        { text: 'Create a React login form', icon: 'ri-reactjs-line', color: 'blue' },
        { text: 'Fix JavaScript async error', icon: 'ri-bug-line', color: 'red' },
        { text: 'MongoDB user authentication', icon: 'ri-database-2-line', color: 'green' },
        { text: 'CSS responsive design', icon: 'ri-css3-line', color: 'purple' },
        { text: 'Node.js API endpoints', icon: 'ri-nodejs-line', color: 'emerald' },
        { text: 'Git workflow help', icon: 'ri-git-branch-line', color: 'orange' }
    ];

    return (
        <div className="flex flex-col h-full bg-gradient-to-b from-purple-50 to-pink-50">
            {/* Welcome Message */}
            {messages.length === 0 && (
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <i className="ri-robot-2-fill text-white text-2xl"></i>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">AI Assistant Ready!</h3>
                    <p className="text-sm text-gray-600 mb-4">Ask me anything about coding, debugging, or project help.</p>
                    <div className="text-xs text-gray-500">
                        💡 Try the quick prompts below or ask your own questions
                    </div>
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-hidden p-4">
                <div className="h-full overflow-y-auto pr-2 space-y-4" style={{maxHeight: 'calc(100vh - 400px)'}}>
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex items-start gap-3 ${
                            message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                        }`}
                    >
                        {/* User Avatar */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0 ${
                            message.sender === 'user' 
                                ? 'bg-gradient-to-r from-blue-500 to-cyan-500' 
                                : 'bg-gradient-to-r from-purple-500 to-pink-500'
                        }`}>
                            {message.sender === 'user' ? (
                                <span>{(user?.name || user?.email || 'U')[0].toUpperCase()}</span>
                            ) : (
                                <i className="ri-robot-2-fill"></i>
                            )}
                        </div>
                        
                        {/* Message Content */}
                        <div className="max-w-md">
                            {/* User Name and Time */}
                            <div className={`mb-1 ${
                                message.sender === 'user' ? 'text-right' : 'text-left'
                            }`}>
                                <span className="font-semibold text-gray-800 text-sm">
                                    {message.sender === 'user' 
                                        ? (user?.name || user?.email?.split('@')[0] || 'You')
                                        : 'AI Assistant'
                                    }
                                </span>
                                <span className="text-gray-500 text-xs ml-2">
                                    {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: true})}
                                </span>
                            </div>
                            
                            {/* Message Bubble */}
                            <div className={`px-4 py-3 rounded-2xl shadow-sm relative ${
                                message.sender === 'user'
                                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-br-sm'
                                    : message.isError
                                    ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300 rounded-bl-sm'
                                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                            }`}>
                                {message.sender === 'ai' && message.text.includes('```') ? (
                                    <div className="text-sm">
                                        {message.text.split('```').map((part, index) => {
                                            if (index % 2 === 1) {
                                                return (
                                                    <pre key={index} className="bg-gray-900 text-green-400 p-3 rounded-lg mt-3 mb-3 overflow-x-auto text-xs border">
                                                        <code>{part}</code>
                                                    </pre>
                                                );
                                            } else {
                                                return <div key={index} className="whitespace-pre-wrap leading-relaxed">{part}</div>;
                                            }
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                
                {/* Loading Animation */}
                {isLoading && (
                    <div className="flex items-start gap-3">
                        {/* AI Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0">
                            <i className="ri-robot-2-fill"></i>
                        </div>
                        
                        {/* Loading Message */}
                        <div className="max-w-md">
                            <div className="mb-1 text-left">
                                <span className="font-semibold text-gray-800 text-sm">AI Assistant</span>
                                <span className="text-gray-500 text-xs ml-2">
                                    {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: true})}
                                </span>
                            </div>
                            <div className="bg-gray-100 text-gray-800 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
                                <div className="flex items-center space-x-3">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                    </div>
                                    <span className="text-sm text-gray-600">AI is thinking...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white/80 backdrop-blur-xl border-t border-white/20">
                {/* Quick Prompts */}
                <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                        {quickPrompts.slice(0, 4).map((prompt, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => setInputMessage(prompt.text)}
                                className={`flex items-center gap-1 px-2 py-1 text-xs rounded-lg transition-all duration-200 ${
                                    prompt.color === 'blue' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                                    prompt.color === 'red' ? 'bg-red-100 text-red-700 hover:bg-red-200' :
                                    prompt.color === 'green' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                                    prompt.color === 'purple' ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' :
                                    prompt.color === 'emerald' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' :
                                    'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                }`}
                                disabled={isLoading}
                            >
                                <i className={prompt.icon}></i>
                                <span className="font-medium text-xs">{prompt.text.split(' ').slice(0, 2).join(' ')}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Message Input */}
                <form onSubmit={sendMessage}>
                    <div className="flex gap-2 items-end">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Ask AI..."
                                className="w-full px-3 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm placeholder-gray-500 text-gray-800 text-sm"
                                disabled={isLoading}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading || !inputMessage.trim()}
                            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm font-medium text-sm"
                        >
                            <i className="ri-send-plane-2-fill"></i>
                            <span>Send</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AIChat;