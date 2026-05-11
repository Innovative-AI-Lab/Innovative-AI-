import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../config/axios';
import { socket, initializeSocket, disconnectSocket } from '../config/socket';
import { UserContext } from '../context/UserContext';
import AIChat from '../components/AIChat';
import FileManager from '../components/FileManager';
import CodeEditor from '../components/CodeEditor';
import Terminal from '../components/Terminal';

/* ─────────────────────────────────────────
   COPY BUTTON
───────────────────────────────────────── */
const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);
  return (
    <button onClick={handleCopy} style={{
      display: 'flex', alignItems: 'center', gap: 5, padding: '3px 9px',
      fontSize: 11, borderRadius: 6, cursor: 'pointer', transition: 'all 0.15s',
      background: copied ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.06)',
      color: copied ? '#4ade80' : '#71717a',
      border: `1px solid ${copied ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.08)'}`,
      fontFamily: "'DM Sans', sans-serif"
    }}>
      <i className={copied ? 'ri-check-line' : 'ri-clipboard-line'} style={{ fontSize: 10 }}></i>
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
};

/* ─────────────────────────────────────────
   INLINE MARKDOWN
───────────────────────────────────────── */
const inlineMarkdown = (text) => {
  const parts = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)|(https?:\/\/[^\s]+))/g;
  let last = 0, match, k = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(<span key={k++}>{text.slice(last, match.index)}</span>);
    if (match[2]) parts.push(<strong key={k++} style={{ color: '#e4e4e7', fontWeight: 600 }}>{match[2]}</strong>);
    else if (match[3]) parts.push(<em key={k++} style={{ color: '#a1a1aa' }}>{match[3]}</em>);
    else if (match[4]) parts.push(<code key={k++} style={{ padding: '1px 6px', borderRadius: 4, background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', fontSize: '0.75rem', fontFamily: "'JetBrains Mono',monospace" }}>{match[4]}</code>);
    else if (match[5] && match[6]) parts.push(<a key={k++} href={match[6]} target="_blank" rel="noopener noreferrer" style={{ color: '#818cf8', textDecorationStyle: 'dotted' }}>{match[5]}</a>);
    else if (match[7]) parts.push(<a key={k++} href={match[7]} target="_blank" rel="noopener noreferrer" style={{ color: '#818cf8', textDecoration: 'underline' }}>{match[7]}</a>);
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(<span key={k++}>{text.slice(last)}</span>);
  return parts.length > 0 ? parts : text;
};


/* ─────────────────────────────────────────
   MARKDOWN RENDERER
───────────────────────────────────────── */
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
        <div key={k()} style={{ margin: '10px 0', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 12px', background: '#18181b', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{lang}</span>
            <CopyButton text={code} />
          </div>
          <pre style={{ background: '#0d0d12', color: '#d4d4d8', padding: '12px 14px', overflowX: 'auto', fontSize: '0.72rem', lineHeight: 1.7, fontFamily: "'JetBrains Mono',monospace", margin: 0 }}><code>{code}</code></pre>
        </div>
      );
      i++; continue;
    }
    if (/^### /.test(line)) { elements.push(<h3 key={k()} style={{ fontSize: '0.78rem', fontWeight: 600, color: '#e4e4e7', margin: '10px 0 3px' }}>{inlineMarkdown(line.slice(4))}</h3>); i++; continue; }
    if (/^## /.test(line)) { elements.push(<h2 key={k()} style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f4f4f5', margin: '12px 0 5px', paddingBottom: 5, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>{inlineMarkdown(line.slice(3))}</h2>); i++; continue; }
    if (/^# /.test(line)) { elements.push(<h1 key={k()} style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', margin: '12px 0 5px' }}>{inlineMarkdown(line.slice(2))}</h1>); i++; continue; }
    if (/^[\-\*] /.test(line)) {
      const items = [];
      while (i < lines.length && /^[\-\*] /.test(lines[i])) {
        items.push(<li key={k()} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: '0.8rem', color: '#a1a1aa', lineHeight: 1.6 }}><span style={{ marginTop: 7, width: 4, height: 4, borderRadius: '50%', background: '#6366f1', flexShrink: 0, display: 'block' }}></span><span>{inlineMarkdown(lines[i].slice(2))}</span></li>);
        i++;
      }
      elements.push(<ul key={k()} style={{ listStyle: 'none', padding: 0, margin: '5px 0' }}>{items}</ul>); continue;
    }
    if (/^\d+\. /.test(line)) {
      const items = []; let num = 1;
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(<li key={k()} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: '0.8rem', color: '#a1a1aa', lineHeight: 1.6 }}><span style={{ flexShrink: 0, width: 17, height: 17, borderRadius: 5, background: 'rgba(99,102,241,0.2)', color: '#818cf8', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>{num++}</span><span>{inlineMarkdown(lines[i].replace(/^\d+\. /, ''))}</span></li>);
        i++;
      }
      elements.push(<ol key={k()} style={{ listStyle: 'none', padding: 0, margin: '5px 0' }}>{items}</ol>); continue;
    }
    if (/^> /.test(line)) { elements.push(<blockquote key={k()} style={{ margin: '5px 0', paddingLeft: 11, borderLeft: '2px solid #6366f1', fontSize: '0.8rem', color: '#71717a', fontStyle: 'italic' }}>{inlineMarkdown(line.slice(2))}</blockquote>); i++; continue; }
    if (/^---+$/.test(line.trim())) { elements.push(<hr key={k()} style={{ margin: '10px 0', borderColor: 'rgba(255,255,255,0.07)' }} />); i++; continue; }
    if (line.trim() === '') { elements.push(<div key={k()} style={{ height: 4 }} />); i++; continue; }
    elements.push(<p key={k()} style={{ fontSize: '0.8rem', color: '#a1a1aa', lineHeight: 1.7, margin: '2px 0' }}>{inlineMarkdown(line)}</p>);
    i++;
  }
  return elements;
};

/* ─────────────────────────────────────────
   AI HELPERS
───────────────────────────────────────── */
const getAIContent = (msg) => {
  const message = msg.message || '';
  if (!message.startsWith('🤖 AI:')) {
    if (!message.startsWith('🤖 AI Assistant:')) return null;
  }
  
  const prefix = message.startsWith('🤖 AI Assistant:') ? '🤖 AI Assistant:' : '🤖 AI:';
  const content = message.slice(prefix.length).trim();
  
  if (content.startsWith('http://') || content.startsWith('https://')) return { type: 'link', url: content };
  return { type: 'text', text: content };
};


/* ─────────────────────────────────────────
   AVATAR
───────────────────────────────────────── */
const Avatar = ({ user: u, size = 32, isAI = false }) => (
  <div style={{
    width: size, height: size, borderRadius: size * 0.3,
    background: isAI ? 'linear-gradient(135deg,#6366f1,#a855f7)' : 'linear-gradient(135deg,#3b82f6,#0ea5e9)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontSize: size * 0.38, fontWeight: 700, flexShrink: 0
  }}>
    {isAI ? '✦' : (u?.displayName || u?.email || 'U')[0].toUpperCase()}
  </div>
);

/* ─────────────────────────────────────────
   TOAST
───────────────────────────────────────── */
const Toast = ({ message, type = 'success', onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, []);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16 }}
      style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
        padding: '11px 16px', borderRadius: 11,
        background: type === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
        border: `1px solid ${type === 'success' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
        backdropFilter: 'blur(16px)', color: type === 'success' ? '#34d399' : '#f87171',
        fontSize: '0.78rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 7,
        fontFamily: "'DM Sans', sans-serif", boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
      }}
    >
      <i className={type === 'success' ? 'ri-check-circle-line' : 'ri-error-warning-line'}></i>
      {message}
    </motion.div>
  );
};

/* ─────────────────────────────────────────
   MESSAGE BUBBLE
───────────────────────────────────────── */
const MessageBubble = ({ msg, isMe, index }) => {
  const aiContent = getAIContent(msg);
  const isAsked = msg.message?.startsWith('💬 Asked AI:');
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: Math.min(index * 0.025, 0.25) }}
      style={{ display: 'flex', alignItems: 'flex-start', gap: 9, flexDirection: isMe ? 'row-reverse' : 'row' }}
    >
      <Avatar user={msg.sender} size={28} isAI={!!aiContent} />
      <div style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
        <span style={{ fontSize: '0.63rem', color: '#3f3f46', marginBottom: 3, fontWeight: 500 }}>
          {aiContent ? 'AI Assistant' : (msg.sender?.displayName || msg.sender?.email?.split('@')[0] || 'User')}
        </span>
        {aiContent ? (
          aiContent.type === 'link' ? (
            <a href={aiContent.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 13px', borderRadius: 11, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)', textDecoration: 'none', maxWidth: 270 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="ri-robot-2-fill" style={{ color: '#fff', fontSize: 13 }}></i>
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#818cf8', margin: 0 }}>AI Response</p>
                <p style={{ fontSize: '0.62rem', color: '#52525b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150 }}>{aiContent.url}</p>
              </div>
              <i className="ri-external-link-line" style={{ color: '#52525b', fontSize: 12 }}></i>
            </a>
          ) : (
            <div style={{ padding: '11px 13px', borderRadius: 11, borderTopLeftRadius: 3, background: 'rgba(22,22,30,0.9)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {renderMarkdown(aiContent.text)}
            </div>
          )
        ) : (
          <div style={{
            padding: '8px 12px', borderRadius: 11, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            borderTopRightRadius: isMe ? 3 : 11, borderTopLeftRadius: isMe ? 11 : 3,
            fontSize: '0.81rem', lineHeight: 1.6,
            ...(isAsked
              ? { background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)', color: '#818cf8', fontStyle: 'italic' }
              : isMe
              ? { background: 'linear-gradient(135deg,#4f46e5,#6366f1)', color: '#fff', boxShadow: '0 3px 14px rgba(99,102,241,0.25)' }
              : { background: '#18181b', color: '#d4d4d8', border: '1px solid rgba(255,255,255,0.06)' })
          }}>
            {inlineMarkdown(msg.message)}
          </div>
        )}
        <span style={{ fontSize: '0.59rem', color: '#3f3f46', marginTop: 3 }}>
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────
   ✦ NAVBAR ATOM: Icon Button
───────────────────────────────────────── */
const NavIconBtn = ({ icon, label, onClick, active = false, style: extraStyle = {}, className = '' }) => (
  <button
    onClick={onClick}
    title={label}
    className={className}
    style={{
      width: 34, height: 34, borderRadius: 9,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', flexShrink: 0, transition: 'all 0.14s',
      background: active ? 'rgba(99,102,241,0.16)' : 'transparent',
      color: active ? '#a5b4fc' : '#4a4a5a',
      border: active ? '1px solid rgba(99,102,241,0.28)' : '1px solid transparent',
      ...extraStyle
    }}
    onMouseEnter={e => {
      if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.055)'; e.currentTarget.style.color = '#9494aa'; }
    }}
    onMouseLeave={e => {
      if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#4a4a5a'; }
    }}
  >
    <i className={icon} style={{ fontSize: 16, pointerEvents: 'none' }}></i>
  </button>
);

/* ─────────────────────────────────────────
   ✦ NAVBAR ATOM: Thin divider
───────────────────────────────────────── */
const VDivider = () => (
  <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.07)', flexShrink: 0 }} />
);

/* ─────────────────────────────────────────
   ✦ NAVBAR MOLECULE: Tab Switcher
───────────────────────────────────────── */
const TabSwitcher = ({ tabs, activeTab, onChange, statusColors }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 1,
    background: 'rgba(255,255,255,0.03)',
    borderRadius: 11, padding: '3px',
    border: '1px solid rgba(255,255,255,0.07)',
  }}>
    {tabs.map(tab => {
      const active = activeTab === tab.id;
      return (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 12px', borderRadius: 8,
            fontSize: '0.72rem', fontWeight: active ? 600 : 500,
            cursor: 'pointer', border: 'none', transition: 'all 0.16s',
            background: active ? 'rgba(255,255,255,0.07)' : 'transparent',
            color: active ? '#e4e4e7' : '#44444e',
            fontFamily: "'DM Sans', sans-serif",
            position: 'relative',
            boxShadow: active ? 'inset 0 0 0 1px rgba(255,255,255,0.09)' : 'none',
          }}
        >
          {/* colored indicator dot when active */}
          {active && (
            <span style={{
              width: 5, height: 5, borderRadius: '50%',
              background: statusColors[tab.id] || '#6366f1',
              flexShrink: 0, display: 'block',
              boxShadow: `0 0 6px ${statusColors[tab.id] || '#6366f1'}`
            }} />
          )}
          <i className={tab.icon} style={{ fontSize: 12 }}></i>
          <span>{tab.label}</span>
        </button>
      );
    })}
  </div>
);

/* ─────────────────────────────────────────
   ✦ NAVBAR MOLECULE: Member Stack
───────────────────────────────────────── */
const MemberStack = ({ members = [], total = 0 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {members.slice(0, 4).map((u, i) => (
        <div
          key={u._id}
          title={u.displayName || u.email}
          style={{
            width: 22, height: 22, borderRadius: '50%',
            background: `hsl(${200 + i * 55},65%,55%)`,
            border: '2px solid #0a0a0f',
            marginLeft: i > 0 ? -7 : 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 8, fontWeight: 700, color: '#fff', flexShrink: 0,
            zIndex: 4 - i, position: 'relative'
          }}
        >
          {(u.displayName || u.email || 'U')[0].toUpperCase()}
        </div>
      ))}
      {total > 4 && (
        <div style={{
          width: 22, height: 22, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)', border: '2px solid #0a0a0f',
          marginLeft: -7, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 8, fontWeight: 700, color: '#71717a', flexShrink: 0, zIndex: 0
        }}>
          +{total - 4}
        </div>
      )}
    </div>
    <span style={{ fontSize: '0.62rem', color: '#3a3a48', fontWeight: 500, whiteSpace: 'nowrap' }}>
      {total} {total === 1 ? 'member' : 'members'}
    </span>
  </div>
);

/* ─────────────────────────────────────────
   MAIN PROJECT PAGE
───────────────────────────────────────── */
const Project = () => {
  const { user } = useContext(UserContext);
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef(null);

  const currentProjectId = location.state?.project?._id || projectId;

  const [activeTab, setActiveTab] = useState('chat');
  const [isTeamOpen, setIsTeamOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isDesktopAiOpen, setIsDesktopAiOpen] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const [projectData, setProjectData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [selectedFile, setSelectedFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const fetchProject = async () => {
    if (!currentProjectId) return;
    try {
      const res = await axios.get(`/projects/${currentProjectId}`);
      setProjectData(res.data.data);
    } catch (e) { 
      console.error('Fetch project error:', e); 
      showToast('Failed to load project details', 'error');
    }
    finally { setLoading(false); }
  };

  const fetchMessages = async () => {
    if (!currentProjectId) return;
    try {
      const res = await axios.get(`/project-chat/messages/${currentProjectId}`);
      setMessages(res.data.data || []); // Standard format: res.data.data
    } catch (e) { console.error('Fetch messages error:', e); }
  };

  useEffect(() => {
    if (!localStorage.getItem('ai_token')) { navigate('/login'); return; }
    
    fetchProject();
    fetchMessages();
    
    axios.get('/users/all').then(res => setUsers(res.data.data.users || [])).catch(console.error);

    // Initialize Socket
    if (user && currentProjectId) {
      const s = initializeSocket(currentProjectId, user._id, user.displayName || user.email);

      s.on('new-message', (msg) => {
        setMessages(prev => [...prev, msg]);
      });

      s.on('user-joined', (data) => {
        showToast(`${data.username} joined the project`);
      });

      s.on('member-added', () => {
        fetchProject();
      });

      return () => {
        s.off('new-message');
        s.off('user-joined');
        s.off('member-added');
        disconnectSocket();
      };
    }
  }, [currentProjectId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!chatInput.trim() || !currentProjectId || sending) return;
    
    const messageContent = chatInput;
    setChatInput('');
    setSending(true);
    
    try {
      // Save to database and the server will broadcast it via Socket
      await axios.post('/project-chat/send', { 
        projectId: currentProjectId, 
        message: messageContent 
      });
      
      // We don't need to fetch messages here anymore, 
      // the socket listener will catch the 'new-message' event
    } catch (e) { 
      showToast('Failed to send message', 'error'); 
    }
    finally { setSending(false); }
  };

  const addUsers = async () => {
    if (selectedUsers.size === 0) return;
    try {
      const promises = Array.from(selectedUsers).map(userId => {
        const user = users.find(u => u._id === userId);
        if (user) {
          return axios.post(`/projects/${currentProjectId}/add-member`, { email: user.email });
        }
        return Promise.resolve();
      });

      await Promise.all(promises);

      // Emit socket event to notify others
      socket.emit('project-update', { roomId: currentProjectId, type: 'member-added' });

      setIsInviteOpen(false);
      setSelectedUsers(new Set());
      fetchProject();
      showToast(`${selectedUsers.size} member(s) added successfully`, 'success');
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to add users', 'error');
    }
  };


  const tabs = [
    { id: 'chat',     icon: 'ri-message-3-line',    label: 'Chat'     },
    { id: 'files',    icon: 'ri-folder-3-line',      label: 'Files'    },
    { id: 'editor',   icon: 'ri-code-s-slash-line',  label: 'Editor'   },
    { id: 'terminal', icon: 'ri-terminal-box-line',  label: 'Terminal' },
  ];

  const TAB_COLORS = {
    chat:     '#22c55e',
    files:    '#f59e0b',
    editor:   '#6366f1',
    terminal: '#10b981',
  };

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0f] font-['DM_Sans'] overflow-hidden text-zinc-400">

      {/* ══════════════════════════════════════════
          ✦  NAVBAR
      ══════════════════════════════════════════ */}
      <header className="flex-shrink-0 bg-[#09090e]/95 border-b border-white/[0.07] backdrop-blur-3xl z-50 sticky top-0">
        {/* ── Main row ── */}
        <div className="flex items-center h-14 px-3 md:px-4 gap-2 md:gap-3">

          {/* ❶ LEFT ZONE — Back + Project identity */}
          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
            <NavIconBtn icon="ri-arrow-left-s-line" label="Home" onClick={() => navigate('/')} />
            <div className="w-[1px] h-5 bg-white/[0.07] hidden sm:block" />

            <div className="relative flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.3)] border border-white/10">
              <i className="ri-folders-fill text-white text-sm"></i>
              <span 
                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#09090e] shadow-sm transition-all duration-300"
                style={{ 
                  background: TAB_COLORS[activeTab],
                  boxShadow: `0 0 8px ${TAB_COLORS[activeTab]}`
                }} 
              />
            </div>

            <div className="flex flex-col min-w-0">
              {loading ? (
                <div className="w-24 h-3 rounded bg-white/5 animate-pulse mb-1" />
              ) : (
                <h1 className="text-[13px] font-bold text-zinc-100 truncate capitalize tracking-tight leading-tight">
                  {projectData?.name || 'Project'}
                </h1>
              )}
              <MemberStack members={projectData?.users || []} total={projectData?.users?.length || 0} />
            </div>
          </div>

          {/* ❷ CENTER ZONE — Tab switcher (desktop) */}
          <div className="hidden md:flex flex-shrink-0">
            <TabSwitcher
              tabs={tabs}
              activeTab={activeTab}
              onChange={setActiveTab}
              statusColors={TAB_COLORS}
            />
          </div>

          {/* ❸ RIGHT ZONE — Actions */}
          <div className="flex items-center gap-1.5 md:gap-2 flex-1 justify-end">

            {/* Invite — desktop */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsInviteOpen(true)}
              className="hidden sm:flex"
              style={{
                alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8,
                fontSize: '0.71rem', fontWeight: 600, cursor: 'pointer',
                background: 'rgba(99,102,241,0.1)', color: '#818cf8',
                border: '1px solid rgba(99,102,241,0.24)', transition: 'all 0.14s',
                fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', flexShrink: 0
              }}
            >
              <i className="ri-user-add-line" style={{ fontSize: 12 }}></i>
              Invite
            </motion.button>

            <VDivider />

            {/* Team — mobile */}
            <NavIconBtn icon="ri-group-line" label="Team" onClick={() => setIsTeamOpen(true)} className="lg:hidden" active={isTeamOpen} />

            {/* AI — mobile */}
            <NavIconBtn icon="ri-robot-2-line" label="AI Assistant" onClick={() => setIsAiOpen(true)} className="lg:hidden" active={isAiOpen} />

            {/* AI toggle — desktop */}
            <NavIconBtn
              icon="ri-robot-2-line"
              label={isDesktopAiOpen ? 'Hide AI' : 'Show AI'}
              onClick={() => setIsDesktopAiOpen(v => !v)}
              active={isDesktopAiOpen}
              className="hidden lg:flex"
            />
          </div>
        </div>

        {/* ── MOBILE Tab row ── */}
        <div className="md:hidden flex border-t border-white/[0.05]">
          {tabs.map(tab => {
            const active = activeTab === tab.id;
            const color = TAB_COLORS[tab.id];
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-all duration-200 border-b-2
                  ${active ? 'text-zinc-100 border-violet-500 bg-white/[0.02]' : 'text-zinc-600 border-transparent hover:text-zinc-400'}`}
              >
                <i className={`${tab.icon} text-base`}></i>
                <span className="text-[10px] font-bold tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* ══════════════════════════════════════════
          BODY
      ══════════════════════════════════════════ */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Team Sidebar — Desktop */}
        <aside className="hidden lg:flex flex-col w-[240px] flex-shrink-0 bg-[#0b0b12] border-r border-white/[0.05]">
          <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between bg-white/[0.01]">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Team</span>
            <button onClick={() => setIsInviteOpen(true)} className="w-7 h-7 rounded-lg hover:bg-white/5 flex items-center justify-center text-zinc-500 hover:text-indigo-400 transition-all">
              <i className="ri-user-add-line text-sm"></i>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
            {projectData?.users?.map((u, idx) => (
              <motion.div key={u._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.03] transition-all group"
              >
                <Avatar user={u} size={28} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-zinc-300 truncate">{u.displayName || u.email?.split('@')[0]}</p>
                  <p className="text-[10px] text-zinc-600 truncate">{u.email}</p>
                </div>
              </motion.div>
            ))}
            {(!projectData?.users || projectData.users.length === 0) && (
              <div className="text-center py-10 opacity-20">
                <i className="ri-team-line text-3xl mb-2 block"></i>
                <p className="text-[10px]">No members</p>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <AnimatePresence mode="wait">
            {activeTab === 'chat' && (
              <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {messages.length === 0 && !loading && (
                    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                      style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 20px' }}>
                      <div style={{ width: 50, height: 50, borderRadius: 14, background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.13)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                        <i className="ri-chat-3-line" style={{ fontSize: 20, color: '#4f46e5' }}></i>
                      </div>
                      <p style={{ fontSize: '0.86rem', fontWeight: 600, color: '#2e2e3c', margin: '0 0 5px' }}>No messages yet</p>
                      <p style={{ fontSize: '0.7rem', color: '#22222c', margin: 0 }}>Start the conversation or ask the AI</p>
                    </motion.div>
                  )}
                  {messages.map((msg, idx) => (
                    <MessageBubble key={msg._id} msg={msg} isMe={msg.sender?.email === user?.email} index={idx} />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                {/* Input */}
                <div style={{ flexShrink: 0, padding: '10px 12px', background: 'rgba(10,10,15,0.9)', borderTop: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#14141c', borderRadius: 11, border: '1px solid rgba(255,255,255,0.07)', padding: '4px 4px 4px 13px' }}>
                    <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                      placeholder="Message your team…"
                      style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#e4e4e7', fontSize: '0.81rem', fontFamily: "'DM Sans', sans-serif", caretColor: '#6366f1' }} />
                    <button onClick={sendMessage} disabled={!chatInput.trim() || sending} style={{
                      width: 32, height: 32, borderRadius: 8, border: 'none',
                      background: chatInput.trim() ? 'linear-gradient(135deg,#4f46e5,#6366f1)' : 'rgba(255,255,255,0.05)',
                      color: chatInput.trim() ? '#fff' : '#2a2a36', cursor: chatInput.trim() ? 'pointer' : 'not-allowed',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s',
                      boxShadow: chatInput.trim() ? '0 2px 10px rgba(99,102,241,0.35)' : 'none', flexShrink: 0
                    }}>
                      {sending
                        ? <i className="ri-loader-4-line" style={{ fontSize: 13, animation: 'spin 1s linear infinite' }}></i>
                        : <i className="ri-send-plane-2-fill" style={{ fontSize: 13 }}></i>}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
            {activeTab === 'files' && (
              <motion.div key="files" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="flex-1 flex overflow-hidden">
                <div className="w-full md:w-[260px] flex-shrink-0 border-r border-white/[0.05] bg-black/20 overflow-y-auto">
                  <FileManager 
                    projectId={currentProjectId} 
                    onFileSelect={(file) => {
                      setSelectedFile(file);
                      // Auto-switch to editor on mobile
                      if (window.innerWidth < 768) setActiveTab('editor');
                    }} 
                  />
                </div>
                <div className="hidden md:block flex-1 overflow-hidden">
                  <CodeEditor selectedFile={selectedFile} />
                </div>
              </motion.div>
            )}
            {activeTab === 'editor' && (
              <motion.div key="editor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="flex-1 overflow-hidden relative">
                {/* Back to files button for mobile */}
                <button 
                  onClick={() => setActiveTab('files')}
                  className="md:hidden absolute top-3 left-3 z-10 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white"
                >
                  <i className="ri-folder-3-line"></i>
                </button>
                <CodeEditor selectedFile={selectedFile} />
              </motion.div>
            )}
            {activeTab === 'terminal' && (
              <motion.div key="terminal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }} style={{ flex: 1, overflow: 'hidden' }}>
                <Terminal />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* AI Sidebar — Desktop */}
        <AnimatePresence>
          {isDesktopAiOpen && (
            <motion.aside className="hidden lg:flex flex-col flex-shrink-0 bg-[#0b0b12] border-l border-white/[0.05] overflow-hidden"
              key="ai-sidebar"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <AIChat projectId={currentProjectId} />
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* ══════════════════════════════════════════
          MOBILE DRAWERS
      ══════════════════════════════════════════ */}
      <AnimatePresence>
        {isTeamOpen && (
          <div className="lg:hidden fixed inset-0 z-[100]">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsTeamOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute left-0 top-0 h-full w-[280px] bg-[#0b0b12] border-r border-white/10 flex flex-col shadow-2xl"
            >
              <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <h2 className="font-bold text-zinc-100 text-sm tracking-tight">Team Members</h2>
                <button onClick={() => setIsTeamOpen(false)} className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-zinc-500">
                  <i className="ri-close-line text-lg"></i>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {projectData?.users?.map(u => (
                  <div key={u._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.03]">
                    <Avatar user={u} size={32} />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-zinc-300 truncate">{u.displayName || u.email?.split('@')[0]}</p>
                      <p className="text-[10px] text-zinc-600 truncate">{u.email}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-white/5">
                <button onClick={() => { setIsTeamOpen(false); setIsInviteOpen(true); }} 
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <i className="ri-user-add-line"></i> Invite Members
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAiOpen && (
          <div className="lg:hidden fixed inset-0 z-[100]">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsAiOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md" />
            <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 250 }}
              className="absolute right-0 top-0 h-full w-full max-w-[360px] bg-[#0b0b12] border-l border-white/10 flex flex-col shadow-2xl"
            >
              <AIChat projectId={currentProjectId} onClose={() => setIsAiOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════
          INVITE MODAL
      ══════════════════════════════════════════ */}
      <AnimatePresence>
        {isInviteOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsInviteOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
            
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#0d0d16] rounded-2xl border border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.6)] overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div>
                  <h2 className="text-sm font-bold text-zinc-100 tracking-tight">Invite Members</h2>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Add collaborators to your workspace</p>
                </div>
                <button onClick={() => { setIsInviteOpen(false); setSelectedUsers(new Set()); }} className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-zinc-500">
                  <i className="ri-close-line text-lg"></i>
                </button>
              </div>

              <div className="max-h-[300px] overflow-y-auto p-2 custom-scrollbar">
                {users.length === 0 ? (
                  <div className="py-12 text-center opacity-30">
                    <i className="ri-user-search-line text-4xl mb-2 block"></i>
                    <p className="text-xs">No users found</p>
                  </div>
                ) : users.map(u => {
                  const alreadyMember = projectData?.users?.some(m => m._id === u._id);
                  const isSelected = selectedUsers.has(u._id);
                  return (
                    <label key={u._id} className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer mb-0.5
                      ${alreadyMember ? 'opacity-40 cursor-not-allowed' : isSelected ? 'bg-indigo-500/10 border-indigo-500/20 border' : 'hover:bg-white/[0.03] border border-transparent'}`}
                    >
                      <input type="checkbox" checked={isSelected} disabled={alreadyMember}
                        onChange={() => {
                          if (alreadyMember) return;
                          const next = new Set(selectedUsers);
                          next.has(u._id) ? next.delete(u._id) : next.add(u._id);
                          setSelectedUsers(next);
                        }} className="hidden" />
                      
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all
                        ${isSelected ? 'bg-indigo-600 border-indigo-500' : 'bg-white/5 border-white/10'}`}>
                        {isSelected && <i className="ri-check-line text-xs text-white"></i>}
                      </div>

                      <Avatar user={u} size={32} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-zinc-200 truncate">{u.displayName || u.email?.split('@')[0]}</p>
                        <p className="text-[10px] text-zinc-600 truncate">{u.email}</p>
                      </div>
                      {alreadyMember && <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-bold">Member</span>}
                    </label>
                  );
                })}
              </div>

              <div className="p-4 border-t border-white/5 bg-white/[0.01] flex gap-3">
                <button onClick={() => setIsInviteOpen(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-zinc-500 hover:bg-white/5 transition-all">
                  Cancel
                </button>
                <button onClick={addUsers} disabled={selectedUsers.size === 0}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 disabled:opacity-30 disabled:shadow-none transition-all active:scale-[0.98]"
                >
                  {selectedUsers.size > 0 ? `Add ${selectedUsers.size} Users` : 'Select Users'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast key="toast" message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
      </AnimatePresence>

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0%,100%{opacity:.35} 50%{opacity:.7} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.07); border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.12); }
      `}</style>
    </div>
  );
};

export default Project;