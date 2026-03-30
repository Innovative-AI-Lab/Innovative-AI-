import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../config/axios";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiChevronDown, FiMessageSquare, FiUser, FiHelpCircle, FiArrowLeft } from "react-icons/fi";
import { UserContext } from "../context/user.context";

const Help = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useContext(UserContext);
  const [search, setSearch] = useState("");
  const [faqData, setFaqData] = useState([
    { question: "How to create a new project?", answer: "To create a new project, click the 'New Project' button in the sidebar. This will open a modal where you can enter the project details." },
    { question: "How do I use the AI Studio?", answer: "Navigate to the 'AI Studio' from the sidebar. You can type a prompt to generate code, text, or other content. The AI will provide a response based on your input." },
    { question: "How can I manage my project files?", answer: "Go to the 'File Manager' tab within a project. You can upload, download, delete, and organize your files and folders there." },
    { question: "Is it possible to invite team members?", answer: "Yes, you can add members to your project. Go to the project settings and look for the 'Members' section to send invitations." },
  ]);
  const [activeIndex, setActiveIndex] = useState(null);

  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredFAQ = faqData.filter((f) =>
    f.question.toLowerCase().includes(search.toLowerCase())
  );

  const handleAI = async () => {
    if (!aiQuery.trim()) return;
    setLoading(true);
    setAiResponse("");
    try {
      const res = await api.post("/ai/generate-response", { prompt: aiQuery });
      let text = res.data.response || "";
      let index = 0;
      const interval = setInterval(() => {
        setAiResponse((prev) => prev + text[index]);
        index++;
        if (index >= text.length) {
          clearInterval(interval);
          setLoading(false);
        }
      }, 15);
    } catch {
      setAiResponse("Error connecting to AI. Please try again.");
      setLoading(false);
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const UserInfo = () => {
    if (isLoading) {
      return <p className="text-gray-500">Loading user...</p>;
    }
    if (user) {
      return (
        <div className="text-gray-400">
          <p><span className="font-semibold text-gray-200">Name:</span> {user.name}</p>
          <p><span className="font-semibold text-gray-200">Email:</span> {user.email}</p>
        </div>
      );
    }
    return <p className="text-gray-500">Not logged in.</p>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a10] to-[#1a1a20] text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <motion.div initial="hidden" animate="visible" variants={fadeIn}>
        {/* BACK BUTTON */}
        <motion.button
          onClick={() => navigate("/")}
          className="absolute top-8 left-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiArrowLeft />
          Back to Home
        </motion.button>

        {/* HEADER */}
        <header className="mb-10 pt-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-2">
            Help & Support Center
          </h1>
          <p className="text-lg text-gray-400">
            Hi, {isLoading ? '...' : (user ? user.name : 'Guest')}. We're here to help you get the most out of our platform.
          </p>
        </header>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT/MAIN: FAQ & USER */}
          <div className="lg:col-span-2">
            {/* SEARCH */}
            <motion.div variants={fadeIn} className="relative mb-8">
              <FiSearch className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-500" />
              <input
                placeholder="Search FAQs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#1f1f2b] border border-transparent focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all duration-300"
              />
            </motion.div>

            {/* FAQ */}
            <motion.div variants={fadeIn}>
              <h2 className="flex items-center text-2xl font-semibold mb-6">
                <FiHelpCircle className="mr-3 text-purple-400"/>
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {filteredFAQ.map((f, i) => (
                  <motion.div
                    key={i}
                    variants={fadeIn}
                    className="bg-[#1f1f2b]/60 rounded-lg shadow-lg overflow-hidden border border-white/10"
                  >
                    <button
                      onClick={() => setActiveIndex(activeIndex === i ? null : i)}
                      className="w-full flex justify-between items-center text-left p-5 focus:outline-none"
                    >
                      <span className="font-medium text-gray-100">{f.question}</span>
                      <motion.div animate={{ rotate: activeIndex === i ? 180 : 0 }}>
                        <FiChevronDown className="text-gray-400" />
                      </motion.div>
                    </button>
                    <AnimatePresence>
                      {activeIndex === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="p-5 pt-0 text-gray-400 leading-relaxed">
                            {f.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
                {filteredFAQ.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No FAQs found matching your search.</p>
                )}
              </div>
            </motion.div>
          </div>

          {/* RIGHT/SIDE: AI & USER INFO */}
          <div className="space-y-8">
            {/* AI HELP */}
            <motion.div variants={fadeIn} className="p-6 rounded-2xl bg-[#1f1f2b]/60 shadow-lg border border-white/10">
              <h2 className="flex items-center text-2xl font-semibold mb-5">
                <FiMessageSquare className="mr-3 text-purple-400"/>
                AI Assistant
              </h2>
              <div className="space-y-4">
                <textarea
                  placeholder="Ask a question about the platform..."
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  className="w-full p-3 h-28 bg-[#161620] rounded-lg outline-none focus:ring-2 focus:ring-purple-500/50 border border-transparent focus:border-purple-500 transition-all"
                  rows="4"
                />
                <motion.button
                  onClick={handleAI}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? "Thinking..." : "Ask AI"}
                </motion.button>
              </div>
              {aiResponse && (
                <div className="mt-5 p-4 bg-black/30 rounded-lg text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {aiResponse}
                </div>
              )}
            </motion.div>
            
            {/* USER INFO */}
            <motion.div variants={fadeIn} className="p-6 rounded-2xl bg-[#1f1f2b]/60 shadow-lg border border-white/10">
                <h2 className="flex items-center text-2xl font-semibold mb-4">
                    <FiUser className="mr-3 text-purple-400"/>
                    Your Account
                </h2>
                <UserInfo />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Help;