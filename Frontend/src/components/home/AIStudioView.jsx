import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from '../../config/axios';
import PageView from '../common/PageView';
import { BRAND } from '../../constants';

function AIStudioView({ user }) {
  const [prompt, setPrompt]     = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', text: `Hello! I'm the ${BRAND.name} AI. Ask me anything about your code, architecture, or project!` }
  ]);
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  const send = async () => {
    if (!prompt.trim() || thinking) return;
    const userMsg = { role: 'user', text: prompt };
    setMessages(prev => [...prev, userMsg]);
    setPrompt('');
    setThinking(true);

    try {
      // Wire to your backend AI endpoint
      const res = await axios.post('/ai/chat', {
        message: userMsg.text,
        history: messages.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text }))
      });
      setMessages(prev => [...prev, { role: 'ai', text: res.data.reply || res.data.message }]);
    } catch {
      // Graceful fallback for demo
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'ai',
          text: `I received: "${userMsg.text}". Connect your /ai/chat backend endpoint to get live AI responses from ${BRAND.name}!`
        }]);
        setThinking(false);
      }, 900);
      return;
    }
    setThinking(false);
  };

  const handleKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, thinking]);

  return (
    <PageView>
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center text-xl">🤖</div>
          <div>
            <h2 className="text-xl font-bold text-zinc-100 tracking-tight">AI Studio</h2>
            <p className="text-[12px] text-zinc-600">{BRAND.name} · Intelligent assistant</p>
          </div>
          <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 tracking-widest">NEW</span>
          <div className="ml-auto flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inset-0 rounded-full bg-emerald-400 opacity-60" />
              <span className="relative rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            AI Online
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-[#0e1017] overflow-hidden">
          {/* Messages */}
          <div className="h-[400px] overflow-y-auto p-5 space-y-4">
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold
                  ${m.role === 'ai'
                    ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white'
                    : 'bg-gradient-to-br from-pink-500 to-rose-500 text-white'}`}>
                  {m.role === 'ai' ? '✦' : (user?.displayName || user?.email || 'U')[0].toUpperCase()}
                </div>
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed
                  ${m.role === 'ai'
                    ? 'bg-white/[0.05] text-zinc-300 rounded-tl-none'
                    : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-tr-none'}`}>
                  {m.text}
                </div>
              </motion.div>
            ))}
            {thinking && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xs text-white font-bold flex-shrink-0">✦</div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-white/[0.05] flex gap-1 items-center">
                  {[0, 1, 2].map(i => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-white/[0.06] p-4 flex gap-3 items-end">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask anything… (Enter to send, Shift+Enter for newline)"
              rows={1}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm text-zinc-200 bg-white/[0.05] border border-white/[0.08] focus:border-violet-500/50 outline-none placeholder-zinc-600 transition-all resize-none"
              style={{ maxHeight: 120, overflowY: 'auto' }}
            />
            <button
              onClick={send}
              disabled={!prompt.trim() || thinking}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 disabled:opacity-30 disabled:cursor-not-allowed hover:-translate-y-0.5 transition-all shadow-lg shadow-violet-500/20 whitespace-nowrap"
            >
              Send →
            </button>
          </div>
        </div>
      </div>
    </PageView>
  );
}

export default AIStudioView;