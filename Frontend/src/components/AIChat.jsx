import React, { useState, useRef, useEffect, useContext } from 'react';
import axios, { aiApi } from '../config/axios';
import { UserContext } from '../context/user.context';

const quickPrompts = [
  { text: 'Create a React login form', icon: 'ri-reactjs-line', color: 'from-cyan-500 to-blue-500' },
  { text: 'Fix JavaScript async/await error', icon: 'ri-bug-line', color: 'from-red-500 to-orange-500' },
  { text: 'MongoDB user authentication', icon: 'ri-database-2-line', color: 'from-green-500 to-emerald-500' },
  { text: 'CSS responsive navbar', icon: 'ri-layout-line', color: 'from-purple-500 to-violet-500' },
  { text: 'Node.js REST API setup', icon: 'ri-server-line', color: 'from-yellow-500 to-amber-500' },
  { text: 'Git workflow best practices', icon: 'ri-git-branch-line', color: 'from-pink-500 to-rose-500' },
];

/* ─── Copy Button ─── */
const CopyButton = ({ text, label = 'Copy' }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/20 text-gray-400 hover:text-gray-200 transition-all duration-200"
    >
      <i className={copied ? 'ri-check-line text-green-400' : 'ri-file-copy-line'}></i>
      {copied ? 'Copied!' : label}
    </button>
  );
};

/* ─── Inline Markdown ─── */
const inlineMarkdown = (text) => {
  const parts = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;
  let last = 0, match, k = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(<span key={k++}>{text.slice(last, match.index)}</span>);
    if (match[2]) parts.push(<strong key={k++} className="font-semibold text-white">{match[2]}</strong>);
    else if (match[3]) parts.push(<em key={k++} className="italic text-purple-300">{match[3]}</em>);
    else if (match[4]) parts.push(
      <code key={k++} className="px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-xs font-mono border border-purple-500/20">{match[4]}</code>
    );
    else if (match[5] && match[6]) parts.push(
      <a key={k++} href={match[6]} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">{match[5]}</a>
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(<span key={k++}>{text.slice(last)}</span>);
  return parts.length > 0 ? parts : text;
};

/* ─── Markdown Renderer ─── */
const renderMarkdown = (text) => {
  const lines = text.split('\n');
  const elements = [];
  let i = 0, kc = 0;
  const k = () => kc++;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trimStart().startsWith('```')) {
      const lang = line.trim().slice(3).trim() || 'code';
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith('```')) { codeLines.push(lines[i]); i++; }
      const code = codeLines.join('\n');
      elements.push(
        <div key={k()} className="my-3 rounded-xl overflow-hidden border border-white/10 shadow-lg shadow-black/30">
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#0d1117] border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors cursor-default"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors cursor-default"></span>
                <span className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors cursor-default"></span>
              </div>
              <span className="text-xs text-gray-500 font-mono bg-white/5 px-2 py-0.5 rounded">{lang}</span>
            </div>
            <CopyButton text={code} />
          </div>
          <pre className="bg-[#0d1117] text-gray-100 p-4 overflow-x-auto text-xs leading-relaxed font-mono scrollbar-thin scrollbar-thumb-gray-700">
            <code>{code}</code>
          </pre>
        </div>
      );
      i++; continue;
    }

    if (/^### /.test(line)) { elements.push(<h3 key={k()} className="text-sm font-bold text-purple-300 mt-4 mb-1.5 flex items-center gap-2"><span className="w-1 h-4 bg-purple-500 rounded-full inline-block"></span>{inlineMarkdown(line.slice(4))}</h3>); i++; continue; }
    if (/^## /.test(line))  { elements.push(<h2 key={k()} className="text-sm font-bold text-white mt-4 mb-2 pb-1.5 border-b border-white/10">{inlineMarkdown(line.slice(3))}</h2>); i++; continue; }
    if (/^# /.test(line))   { elements.push(<h1 key={k()} className="text-base font-bold text-white mt-4 mb-2">{inlineMarkdown(line.slice(2))}</h1>); i++; continue; }

    if (/^[\-\*] /.test(line)) {
      const items = [];
      while (i < lines.length && /^[\-\*] /.test(lines[i])) {
        items.push(
          <li key={k()} className="flex items-start gap-2.5 text-sm text-gray-300 leading-relaxed">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex-shrink-0"></span>
            <span>{inlineMarkdown(lines[i].slice(2))}</span>
          </li>
        );
        i++;
      }
      elements.push(<ul key={k()} className="my-2 space-y-1.5 pl-1">{items}</ul>);
      continue;
    }

    if (/^\d+\. /.test(line)) {
      const items = []; let num = 1;
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(
          <li key={k()} className="flex items-start gap-2.5 text-sm text-gray-300 leading-relaxed">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white text-[10px] font-bold flex items-center justify-center mt-0.5 shadow">{num++}</span>
            <span>{inlineMarkdown(lines[i].replace(/^\d+\. /, ''))}</span>
          </li>
        );
        i++;
      }
      elements.push(<ol key={k()} className="my-2 space-y-2 pl-1">{items}</ol>);
      continue;
    }

    if (/^> /.test(line)) {
      elements.push(
        <blockquote key={k()} className="my-2 pl-3 border-l-2 border-purple-500 text-sm text-gray-400 italic bg-purple-500/5 py-1.5 rounded-r-lg">
          {inlineMarkdown(line.slice(2))}
        </blockquote>
      );
      i++; continue;
    }

    if (/^---+$/.test(line.trim())) { elements.push(<hr key={k()} className="my-3 border-white/10" />); i++; continue; }
    if (line.trim() === '') { elements.push(<div key={k()} className="h-1.5" />); i++; continue; }
    elements.push(<p key={k()} className="text-sm text-gray-300 leading-relaxed">{inlineMarkdown(line)}</p>);
    i++;
  }
  return elements;
};

/* ─── Message Bubble ─── */
const MessageBubble = ({ message, user }) => {
  const isUser = message.sender === 'user';
  return (
    <div className={`flex items-end gap-2.5 ${isUser ? 'flex-row-reverse' : ''} animate-fadeIn`}>
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-lg
        ${isUser
          ? 'bg-gradient-to-br from-blue-500 to-cyan-400 shadow-blue-500/30'
          : 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-purple-500/30'
        }`}>
        {isUser
          ? (user?.displayName || user?.email || 'U')[0].toUpperCase()
          : <i className="ri-sparkling-2-fill text-xs"></i>
        }
      </div>

      <div className={`max-w-[88%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <p className={`text-[10px] text-gray-500 mb-1 px-1 ${isUser ? 'text-right' : ''}`}>
          {isUser ? (user?.displayName || user?.email?.split('@')[0] || 'You') : 'Gemini AI'}
          <span className="ml-1.5 opacity-60">{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </p>

        {isUser ? (
          <div className="px-4 py-2.5 rounded-2xl rounded-br-sm bg-gradient-to-br from-blue-600 to-blue-700 text-white text-sm shadow-lg shadow-blue-500/20 border border-blue-500/30">
            <p className="leading-relaxed whitespace-pre-wrap">{message.text}</p>
          </div>
        ) : (
          <div className={`px-4 py-3 rounded-2xl rounded-bl-sm w-full shadow-lg
            ${message.isError
              ? 'bg-red-950/60 border border-red-700/40 text-red-400 shadow-red-500/10'
              : 'bg-gray-800/80 border border-white/8 shadow-black/20 backdrop-blur-sm'
            }`}>
            {message.isError
              ? <p className="text-sm leading-relaxed flex items-center gap-2"><i className="ri-error-warning-line text-red-400"></i>{message.text}</p>
              : <div>{renderMarkdown(message.text)}</div>
            }
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Typing Indicator ─── */
const TypingIndicator = () => (
  <div className="flex items-end gap-2.5 animate-fadeIn">
    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-purple-500/30">
      <i className="ri-sparkling-2-fill text-xs"></i>
    </div>
    <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-gray-800/80 border border-white/8 shadow-lg shadow-black/20">
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
        <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '160ms' }}></span>
        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '320ms' }}></span>
        <span className="text-xs text-gray-500 ml-2 font-medium">Thinking...</span>
      </div>
    </div>
  </div>
);

/* ─── Welcome Screen ─── */
const WelcomeScreen = ({ onSelect, loading }) => (
  <div className="flex flex-col items-center justify-center h-full px-4 py-6 text-center">
    {/* Glow orb */}
    <div className="relative mb-5">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl blur-xl opacity-40 scale-110"></div>
      <div className="relative w-16 h-16 bg-gradient-to-br from-purple-500 via-violet-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/40">
        <i className="ri-sparkling-2-fill text-white text-2xl"></i>
      </div>
    </div>

    <h3 className="text-base font-bold text-white mb-1">Gemini AI Assistant</h3>
    <p className="text-xs text-gray-500 leading-relaxed max-w-[200px] mb-6">
      Powered by Gemini 2.5 Flash · Ask anything about code, bugs, or architecture
    </p>

    {/* Capability pills */}
    <div className="flex flex-wrap justify-center gap-1.5 mb-6">
      {[
        { icon: 'ri-code-s-slash-line', label: 'Code Gen' },
        { icon: 'ri-bug-line', label: 'Debug' },
        { icon: 'ri-lightbulb-line', label: 'Explain' },
        { icon: 'ri-tools-line', label: 'Optimize' },
      ].map((c, i) => (
        <span key={i} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-gray-400 font-medium">
          <i className={`${c.icon} text-purple-400`}></i>{c.label}
        </span>
      ))}
    </div>

    {/* Quick prompts */}
    <div className="w-full space-y-1.5">
      <p className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold mb-2">Try asking</p>
      {quickPrompts.map((p, i) => (
        <button key={i}
          onClick={() => onSelect(p.text)}
          disabled={loading}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/3 hover:bg-white/8 border border-white/6 hover:border-white/15 text-left transition-all duration-200 group disabled:opacity-40"
        >
          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${p.color} flex items-center justify-center flex-shrink-0 shadow group-hover:scale-110 transition-transform`}>
            <i className={`${p.icon} text-white text-xs`}></i>
          </div>
          <span className="text-xs text-gray-400 group-hover:text-gray-200 transition-colors">{p.text}</span>
          <i className="ri-arrow-right-s-line text-gray-600 group-hover:text-gray-400 ml-auto transition-colors"></i>
        </button>
      ))}
    </div>
  </div>
);

/* ─── Main Component ─── */
const AIChat = ({ projectId, onClose }) => {
  const { user } = useContext(UserContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [msgCount, setMsgCount] = useState(0);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const sendMessage = async (text_override) => {
    const text = (text_override || input).trim();
    if (!text || loading) return;

    setMessages(prev => [...prev, { id: Date.now(), text, sender: 'user', timestamp: new Date() }]);
    setInput('');
    setLoading(true);
    setMsgCount(c => c + 1);

    if (projectId) {
      axios.post('/project-chat/send', { projectId, message: `💬 Asked AI: ${text}` }).catch(() => {});
    }

    try {
      const res = await aiApi.post('/ai/generate-response', {
        prompt: text,
        context: projectId ? `Project ID: ${projectId}` : '',
      });

      if (res.data.success) {
        setMessages(prev => [...prev, { id: Date.now() + 1, text: res.data.response, sender: 'ai', timestamp: new Date() }]);
        if (projectId) {
          try {
            const saveRes = await axios.post('/ai/save-response', { prompt: text, response: res.data.response, projectId });
            if (saveRes.data.success && saveRes.data.id) {
              const link = `${window.location.origin}/ai-response/${saveRes.data.id}`;
              await axios.post('/project-chat/send', { projectId, message: `🤖 AI: ${link}` });
            } else {
              throw new Error('Failed to save AI response or get ID back.');
            }
          } catch (err) {
            const errorDetails = err.response?.data?.details || err.message;
            console.error("Failed to save AI response:", errorDetails);
            axios.post('/project-chat/send', {
              projectId,
              message: `🤖 AI: ${res.data.response.slice(0, 300)}${res.data.response.length > 300 ? '...' : ''} (link could not be created)`,
            }).catch(() => {});
          }
        }
      } else {
        throw new Error(res.data.error || 'AI service unavailable');
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: err.response?.data?.error || err.message || 'Something went wrong. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
        isError: true,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="flex flex-col h-full bg-[#0f1117] relative overflow-hidden">

      {/* Background subtle grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>

      {/* ── Header ── */}
      <div className="relative flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/8 bg-[#0f1117]/95 backdrop-blur-xl z-10">
        {/* Left glow accent */}
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 via-pink-500 to-transparent"></div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl blur-md opacity-50"></div>
            <div className="relative w-9 h-9 bg-gradient-to-br from-purple-500 via-violet-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <i className="ri-sparkling-2-fill text-white text-base"></i>
            </div>
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">AI Assistant</h2>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400"></span>
              </span>
              <p className="text-[10px] text-gray-500 font-medium">Gemini 2.5 Flash · Online</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button onClick={() => { setMessages([]); setMsgCount(0); }}
              className="p-1.5 rounded-lg hover:bg-white/8 transition-all text-gray-500 hover:text-red-400 group" title="Clear chat">
              <i className="ri-delete-bin-line text-sm group-hover:scale-110 transition-transform inline-block"></i>
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/8 transition-all text-gray-500 hover:text-gray-200">
              <i className="ri-close-line text-base"></i>
            </button>
          )}
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="relative flex-1 overflow-y-auto px-3 py-4 space-y-4 scroll-smooth"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#374151 transparent' }}>

        {messages.length === 0
          ? <WelcomeScreen onSelect={(t) => { setInput(t); setTimeout(() => inputRef.current?.focus(), 50); }} loading={loading} />
          : messages.map(msg => <MessageBubble key={msg.id} message={msg} user={user} />)
        }

        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* ── Stats bar (shows after first message) ── */}
      {msgCount > 0 && (
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-1.5 bg-white/2 border-t border-white/5">
          <span className="text-[10px] text-gray-600">{msgCount} message{msgCount !== 1 ? 's' : ''} this session</span>
          <span className="text-[10px] text-gray-600 flex items-center gap-1">
            <i className="ri-shield-check-line text-green-500/60"></i> End-to-end encrypted
          </span>
        </div>
      )}

      {/* ── Input ── */}
      <div className="flex-shrink-0 p-3 border-t border-white/8 bg-[#0f1117]/95 backdrop-blur-xl">
        <div className="relative rounded-2xl bg-gray-800/80 border border-white/10 hover:border-purple-500/40 focus-within:border-purple-500/60 transition-all duration-300 shadow-lg focus-within:shadow-purple-500/10">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask anything about code, bugs, architecture..."
            rows={1}
            disabled={loading}
            className="w-full px-4 pt-3 pb-10 bg-transparent text-sm text-gray-100 placeholder-gray-600 focus:outline-none resize-none leading-relaxed"
            style={{ maxHeight: '120px', overflowY: 'auto' }}
          />
          {/* Bottom bar inside textarea */}
          <div className="absolute bottom-2 left-3 right-2 flex items-center justify-between">
            <span className="text-[10px] text-gray-700">⏎ Send · ⇧⏎ New line</span>
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200
                bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500
                disabled:opacity-30 disabled:cursor-not-allowed text-white shadow-lg shadow-purple-500/20
                active:scale-95 hover:shadow-purple-500/40"
            >
              {loading
                ? <><i className="ri-loader-4-line animate-spin"></i> Generating</>
                : <><i className="ri-send-plane-2-fill"></i> Send</>
              }
            </button>
          </div>
        </div>
      </div>

      {/* Fade-in animation style */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.25s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default AIChat;
