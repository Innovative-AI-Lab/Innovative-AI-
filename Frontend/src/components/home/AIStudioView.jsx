import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../../config/axios';
import { BRAND } from '../../constants';

/* ─── UI COMPONENTS ─── */
const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button 
      onClick={handleCopy}
      className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-zinc-200 transition-all"
    >
      <i className={copied ? "ri-check-line text-emerald-500" : "ri-file-copy-line"}></i>
    </button>
  );
};

const Typewriter = ({ text, onComplete }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, 5); 
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [index, text, onComplete]);

  return <div className="markdown-content">{renderMarkdown(displayedText)}</div>;
};

const inlineMarkdown = (text) => {
  const parts = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)|(https?:\/\/[^\s]+))/g;
  let last = 0, match, k = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(<span key={k++}>{text.slice(last, match.index)}</span>);
    if (match[2]) parts.push(<strong key={k++} className="font-bold text-white">{match[2]}</strong>);
    else if (match[3]) parts.push(<em key={k++} className="italic text-violet-300">{match[3]}</em>);
    else if (match[4]) parts.push(<code key={k++} className="px-1.5 py-0.5 rounded bg-white/10 text-violet-300 font-mono text-[12px]">{match[4]}</code>);
    else if (match[5] && match[6]) parts.push(<a key={k++} href={match[6]} target="_blank" rel="noreferrer" className="text-violet-400 underline">{match[5]}</a>);
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(<span key={k++}>{text.slice(last)}</span>);
  return parts;
};

const renderMarkdown = (text) => {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let i = 0, kc = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3) || 'code';
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) { codeLines.push(lines[i]); i++; }
      const code = codeLines.join('\n');
      elements.push(
        <div key={kc++} className="my-3 rounded-xl overflow-hidden border border-white/10 bg-[#0d1117]">
          <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
            <span className="text-[10px] font-bold text-zinc-500 uppercase">{lang}</span>
            <CopyButton text={code} />
          </div>
          <pre className="p-4 overflow-x-auto text-[12px] font-mono leading-relaxed text-zinc-300 custom-scrollbar"><code>{code}</code></pre>
        </div>
      );
      i++; continue;
    }
    if (line.trim() === '') { elements.push(<div key={kc++} className="h-3" />); i++; continue; }
    elements.push(<p key={kc++} className="mb-2 last:mb-0">{inlineMarkdown(line)}</p>);
    i++;
  }
  return elements;
};

/* ─── MAIN COMPONENT ─── */
function AIStudioView({ user }) {
  const [prompt, setPrompt]     = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', text: `Hello! I'm the **${BRAND.name} AI**. How can I help you with your project today?`, timestamp: new Date() }
  ]);
  const [thinking, setThinking] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [prompt]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages, thinking]);

  const send = async () => {
    const text = prompt.trim();
    if (!text || thinking) return;

    const userMsg = { role: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setPrompt('');
    setThinking(true);

    try {
      const res = await axios.post('/ai/chat', {
        message: text,
        history: messages.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text }))
      });

      const aiReply = res.data?.data?.reply || res.data?.reply || "I'm sorry, I couldn't process that.";
      setThinking(false);
      setMessages(prev => [...prev, { role: 'ai', text: aiReply, timestamp: new Date(), isTyping: true }]);
    } catch (err) {
      setThinking(false);
      setMessages(prev => [...prev, { role: 'ai', text: "⚠️ **Connection Error**: Failed to reach AI service.", timestamp: new Date() }]);
    }
  };

  const handleKey = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  return (
    <div className="flex flex-col h-full bg-transparent text-zinc-200 overflow-hidden font-['Syne',sans-serif]">
      
      {/* Internal Header */}
      <header className="h-14 border-b border-white/[0.05] flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">AI Agent Online</span>
          </div>
        </div>
        <button 
          onClick={() => setMessages([{ role: 'ai', text: 'How can I help?', timestamp: new Date() }])}
          className="text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-all"
        >
          Reset Session
        </button>
      </header>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pt-10 pb-40">
        <div className="max-w-3xl mx-auto px-6 space-y-12">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-6 group"
              >
                {/* Avatar Column */}
                <div className="shrink-0 pt-1">
                  {m.role === 'ai' ? (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                      <i className="ri-sparkling-2-fill text-white text-lg"></i>
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 shadow-sm">
                      <i className="ri-user-3-line text-lg"></i>
                    </div>
                  )}
                </div>

                {/* Message Content Column */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                      {m.role === 'ai' ? 'Innovative AI' : 'You'}
                    </span>
                    <span className="text-[10px] text-zinc-700">
                      {m.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-[15px] leading-relaxed text-zinc-300 antialiased">
                    {m.isTyping ? (
                      <Typewriter text={m.text} onComplete={() => {
                        const newMsgs = [...messages];
                        newMsgs[i].isTyping = false;
                        setMessages(newMsgs);
                      }} />
                    ) : (
                      renderMarkdown(m.text)
                    )}
                  </div>
                  {m.role === 'ai' && !m.isTyping && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity pt-2">
                      <CopyButton text={m.text} />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {thinking && (
            <div className="flex gap-6">
              <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center animate-pulse">
                <i className="ri-robot-2-line text-zinc-600"></i>
              </div>
              <div className="flex items-center gap-2 text-zinc-500 text-sm">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map(dot => (
                    <motion.span 
                      key={dot}
                      animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                      transition={{ repeat: Infinity, duration: 1.2, delay: dot * 0.2 }}
                      className="w-1.5 h-1.5 bg-violet-500/50 rounded-full"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Sticky Bottom Input */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0a0b0f] via-[#0a0b0f]/80 to-transparent">
        <div className="max-w-3xl mx-auto">
          <div className="relative group">
            <div className="absolute inset-0 bg-violet-600/5 blur-3xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
            <div className="relative bg-[#16181d] border border-white/[0.08] rounded-2xl shadow-2xl focus-within:border-violet-500/40 transition-all p-2">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={handleKey}
                placeholder="How can I help you today?"
                rows={1}
                className="w-full bg-transparent border-none outline-none px-4 py-3 text-[15px] text-zinc-100 placeholder-zinc-700 resize-none custom-scrollbar"
                style={{ maxHeight: '200px' }}
              />
              <div className="flex items-center justify-between px-2 pb-1 pt-1">
                <div className="flex gap-1">
                  <button className="p-2 text-zinc-600 hover:text-zinc-400 transition-colors"><i className="ri-attachment-2"></i></button>
                  <button className="p-2 text-zinc-600 hover:text-zinc-400 transition-colors"><i className="ri-image-line"></i></button>
                </div>
                <button 
                  onClick={send}
                  disabled={!prompt.trim() || thinking}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${prompt.trim() && !thinking ? 'bg-white text-black hover:bg-violet-500 hover:text-white' : 'bg-white/5 text-zinc-800'}`}
                >
                  <i className="ri-arrow-up-line text-lg font-bold"></i>
                </button>
              </div>
            </div>
            <p className="text-[10px] text-zinc-800 text-center mt-3 font-bold uppercase tracking-tighter">AI-generated content may be incorrect. Verify critical details.</p>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 10px; }
        .markdown-content p { margin-bottom: 0.8rem; }
        .markdown-content p:last-child { margin-bottom: 0; }
        .markdown-content code { background: rgba(255,255,255,0.08); padding: 0.1rem 0.35rem; border-radius: 0.3rem; font-family: monospace; font-size: 0.9em; color: #a78bfa; }
      `}</style>
    </div>
  );
}

export default AIStudioView;