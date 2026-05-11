import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../config/axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiSearch, 
  FiChevronDown, 
  FiMessageSquare, 
  FiUser, 
  FiHelpCircle, 
  FiArrowLeft, 
  FiSend, 
  FiCpu, 
  FiZap, 
  FiInfo, 
  FiMail, 
  FiShield 
} from "react-icons/fi";
import { UserContext } from "../context/UserContext";

/* ─────────────────────────────────────────────
   HELP PAGE - PREMIUM REDESIGN
───────────────────────────────────────────── */

const Help = () => {
  const navigate = useNavigate();
  const { user, isLoading: userLoading } = useContext(UserContext);
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(null);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef(null);

  const faqData = [
    { 
      question: "How to create a new project?", 
      answer: "Click the 'New Project' button on your dashboard. Provide a project name and description, and you'll be redirected to your new workspace immediately." 
    },
    { 
      question: "How do I use the AI Studio?", 
      answer: "Navigate to AI Studio from the sidebar. Use natural language prompts to generate code, refactor snippets, or explain complex logic. The AI is integrated directly with your project context." 
    },
    { 
      question: "How can I manage my project files?", 
      answer: "Inside any project, use the 'File Explorer' tab. You can create, edit, and delete files. Our real-time sync ensures your changes are saved instantly." 
    },
    { 
      question: "Is it possible to invite team members?", 
      answer: "Yes! Open your Project Settings and navigate to the 'Team' tab. Enter the email address of the member you'd like to invite and assign them a role." 
    },
    { 
      question: "How do I change my theme or font size?", 
      answer: "Go to the Settings page from the sidebar. Under the 'Preferences' tab, you can toggle between Dark/Light modes and adjust the editor font size." 
    }
  ];

  const filteredFAQ = faqData.filter((f) =>
    f.question.toLowerCase().includes(search.toLowerCase())
  );

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [aiQuery]);

  const handleAI = async () => {
    if (!aiQuery.trim() || loading) return;
    setLoading(true);
    setAiResponse("");
    try {
      const res = await api.post("/ai/generate-response", { prompt: aiQuery });
      // Correct data path: res.data.data.response
      const rawText = res.data?.data?.response || res.data?.response || "I'm sorry, I couldn't generate a response.";
      const text = String(rawText);
      
      // Safer typing effect
      let index = 0;
      const interval = setInterval(() => {
        if (index < text.length) {
          setAiResponse((prev) => prev + text[index]);
          index++;
        } else {
          clearInterval(interval);
          setLoading(false);
        }
      }, 10);
    } catch (err) {
      setAiResponse("Error: Unable to connect to AI Assistant. Please check your connection.");
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAI();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-gray-200 font-['Syne',sans-serif] selection:bg-purple-500/30 overflow-x-hidden">
      
      {/* BACKGROUND DECORATION */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[35%] h-[35%] bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* TOP BAR */}
        <div className="flex items-center justify-between mb-12">
          <motion.button
            onClick={() => navigate("/")}
            whileHover={{ x: -5 }}
            className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors font-semibold text-sm group"
          >
            <FiArrowLeft className="group-hover:text-purple-500 transition-colors" />
            Back to Home
          </motion.button>
          
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">System Online</span>
          </div>
        </div>

        {/* HERO SECTION */}
        <header className="mb-16 text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold mb-6"
          >
            <FiZap /> INNOVATIVE AI SUPPORT
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-extrabold text-white tracking-tighter mb-6"
          >
            How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">help you?</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-500 leading-relaxed"
          >
            Search our knowledge base or chat with our AI Assistant to resolve your queries instantly.
          </motion.p>
        </header>

        {/* GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">
          
          {/* MAIN COLUMN */}
          <div className="space-y-12">
            
            {/* SEARCH AREA */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative group"
            >
              <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-500 transition-colors size-5" />
              <input
                type="text"
                placeholder="Search for articles, guides, or FAQs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-[24px] py-6 pl-16 pr-6 text-lg text-white placeholder:text-gray-600 outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all shadow-2xl backdrop-blur-md"
              />
            </motion.div>

            {/* FAQ SECTION */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <FiHelpCircle className="text-purple-500" />
                  Knowledge Base
                </h2>
                <span className="text-xs text-gray-500 font-medium">{filteredFAQ.length} Results</span>
              </div>
              
              <div className="space-y-4">
                {filteredFAQ.map((faq, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 ${activeIndex === idx ? 'ring-1 ring-purple-500/30 bg-white/[0.07]' : 'hover:bg-white/[0.07]'}`}
                  >
                    <button
                      onClick={() => setActiveIndex(activeIndex === idx ? null : idx)}
                      className="w-full flex items-center justify-between p-6 text-left outline-none"
                    >
                      <span className="text-base font-semibold text-gray-200">{faq.question}</span>
                      <FiChevronDown className={`text-gray-500 transition-transform duration-300 ${activeIndex === idx ? 'rotate-180 text-purple-500' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {activeIndex === idx && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-6 pb-6 text-gray-400 text-sm leading-relaxed"
                        >
                          <div className="pt-2 border-t border-white/5">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
                {filteredFAQ.length === 0 && (
                  <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                    <FiSearch className="mx-auto size-10 text-gray-700 mb-4" />
                    <p className="text-gray-500 font-medium">No results matching your search.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* SIDEBAR COLUMN */}
          <aside className="space-y-8">
            
            {/* AI ASSISTANT CARD */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-8 rounded-[32px] bg-gradient-to-b from-[#1a1a22] to-[#121218] border border-white/10 shadow-2xl relative overflow-hidden group"
            >
              {/* Decorative Glow */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-colors" />

              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-600/20">
                  <FiCpu size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">AI Assistant</h3>
                  <p className="text-[11px] text-purple-400 uppercase tracking-widest font-bold">24/7 Support</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    placeholder="Describe your issue..."
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 pr-12 text-sm text-white placeholder:text-gray-600 outline-none focus:border-purple-500/50 transition-all resize-none min-h-[100px] max-h-[300px]"
                  />
                  <button 
                    onClick={handleAI}
                    disabled={loading || !aiQuery.trim()}
                    className="absolute right-3 bottom-3 w-8 h-8 bg-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg hover:scale-110 active:scale-95 disabled:bg-gray-800 disabled:text-gray-500 disabled:scale-100 transition-all"
                  >
                    {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSend size={14} />}
                  </button>
                </div>

                <AnimatePresence>
                  {aiResponse && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 bg-purple-500/5 border border-purple-500/10 rounded-2xl"
                    >
                      <div className="flex items-center gap-2 text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-3">
                        <FiMessageSquare size={12} /> Response
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap italic font-medium">
                        {aiResponse}
                      </p>
                      {loading && <span className="inline-block w-1.5 h-4 bg-purple-500 ml-1 animate-pulse align-middle" />}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-600">
                <span className="flex items-center gap-1.5"><FiZap className="text-amber-500" /> Fast Response</span>
                <span className="flex items-center gap-1.5"><FiShield className="text-blue-500" /> Secure Chat</span>
              </div>
            </motion.div>

            {/* ACCOUNT CARD */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="p-8 rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-xl"
            >
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                <FiUser className="text-blue-500" />
                Account Overview
              </h3>
              
              {userLoading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-white/10 rounded w-3/4" />
                  <div className="h-4 bg-white/10 rounded w-1/2" />
                </div>
              ) : user ? (
                <div className="space-y-5">
                  <div className="flex items-center gap-4 p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
                      {user.displayName ? user.displayName[0].toUpperCase() : user.email[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Full Name</p>
                      <p className="text-sm font-bold text-gray-200 truncate">{user.displayName || 'Not Set'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-gray-400">
                      <FiMail size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Email Address</p>
                      <p className="text-sm font-bold text-gray-200 truncate">{user.email}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => navigate("/settings")}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white transition-all active:scale-[0.98]"
                  >
                    Manage Account Settings
                  </button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <FiInfo className="mx-auto size-6 text-gray-600 mb-3" />
                  <p className="text-sm text-gray-500 mb-4">Please log in to see your details.</p>
                  <button onClick={() => navigate("/login")} className="px-6 py-2 bg-purple-600 rounded-lg text-white text-xs font-bold">Log In</button>
                </div>
              )}
            </motion.div>

          </aside>
        </div>
      </div>

      {/* FOOTER MINI */}
      <footer className="mt-20 py-10 border-t border-white/5 text-center">
        <p className="text-gray-600 text-xs">© 2026 Innovative AI Studio. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Help;