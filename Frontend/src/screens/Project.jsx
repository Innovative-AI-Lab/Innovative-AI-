import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../config/axios';
import { UserContext } from '../context/user.context';
import AIChat from '../components/AIChat';
import FileManager from '../components/FileManager';
import CodeEditor from '../components/CodeEditor';
import Terminal from '../components/Terminal';

/* ─────────────────────────────────────────
   COPY BUTTON
───────────────────────────────────────── */
const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      style={{
        display: 'flex', alignItems: 'center', gap: 5, padding: '3px 9px',
        fontSize: 11, borderRadius: 6, cursor: 'pointer', transition: 'all 0.15s',
        background: copied ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.06)',
        color: copied ? '#4ade80' : '#71717a',
        border: `1px solid ${copied ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.08)'}`,
        fontFamily: "'DM Sans', sans-serif"
      }}
    >
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
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;
  let last = 0, match, k = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(<span key={k++}>{text.slice(last, match.index)}</span>);
    if (match[2]) parts.push(<strong key={k++} style={{ color: '#e4e4e7', fontWeight: 600 }}>{match[2]}</strong>);
    else if (match[3]) parts.push(<em key={k++} style={{ color: '#a1a1aa' }}>{match[3]}</em>);
    else if (match[4]) parts.push(<code key={k++} style={{ padding: '1px 6px', borderRadius: 4, background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', fontSize: '0.75rem', fontFamily: "'JetBrains Mono',monospace" }}>{match[4]}</code>);
    else if (match[5] && match[6]) parts.push(<a key={k++} href={match[6]} target="_blank" rel="noopener noreferrer" style={{ color: '#818cf8', textDecorationStyle: 'dotted' }}>{match[5]}</a>);
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
  if (!msg.message?.startsWith('🤖 AI:')) return null;
  const content = msg.message.slice(6).trim();
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
            {msg.message}
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
      const res = await axios.get(`/projects/get-project/${currentProjectId}`);
      setProjectData(res.data.project);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchMessages = async () => {
    if (!currentProjectId) return;
    try {
      const res = await axios.get(`/project-chat/messages/${currentProjectId}`);
      setMessages(res.data.messages || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/login'); return; }
    fetchProject();
    fetchMessages();
    axios.get('/users/all').then(res => setUsers(res.data.users || [])).catch(console.error);
  }, [currentProjectId]);

  useEffect(() => {
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [currentProjectId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!chatInput.trim() || !currentProjectId || sending) return;
    setSending(true);
    try {
      await axios.post('/project-chat/send', { projectId: currentProjectId, message: chatInput });
      setChatInput('');
      fetchMessages();
    } catch (e) { showToast('Failed to send message', 'error'); }
    finally { setSending(false); }
  };

  const addUsers = async () => {
    if (selectedUsers.size === 0) return;
    try {
      await axios.put('/projects/add-user', { projectId: currentProjectId, users: Array.from(selectedUsers) });
      setIsInviteOpen(false);
      setSelectedUsers(new Set());
      fetchProject();
      showToast(`${selectedUsers.size} member(s) added successfully`);
    } catch (e) {
      showToast(e.response?.data?.error || 'Failed to add users', 'error');
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
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      background: '#0a0a0f', fontFamily: "'DM Sans', sans-serif",
      overflow: 'hidden', color: '#d4d4d8'
    }}>

      {/* ══════════════════════════════════════════
          ✦  NAVBAR
      ══════════════════════════════════════════ */}
      <header style={{
        flexShrink: 0,
        background: 'rgba(9,9,14,0.96)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        zIndex: 50, position: 'relative'
      }}>

        {/* ── Main row ── */}
        <div style={{
          display: 'flex', alignItems: 'center',
          height: 54, padding: '0 12px', gap: 8
        }}>

          {/* ❶ LEFT ZONE — Back + Project identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>

            {/* Back */}
            <NavIconBtn icon="ri-arrow-left-s-line" label="Home" onClick={() => navigate('/')} />

            <VDivider />

            {/* Project icon */}
            <div style={{
              width: 30, height: 30, borderRadius: 8, flexShrink: 0,
              background: 'linear-gradient(135deg,#4338ca,#7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 0 1px rgba(99,102,241,0.4), 0 4px 12px rgba(79,70,229,0.25)',
              position: 'relative'
            }}>
              <i className="ri-folders-fill" style={{ color: '#fff', fontSize: 14 }}></i>
              {/* activity dot — color changes with active tab */}
              <span style={{
                position: 'absolute', bottom: -2, right: -2,
                width: 8, height: 8, borderRadius: '50%',
                background: TAB_COLORS[activeTab],
                border: '1.5px solid #09090e',
                transition: 'background 0.35s ease',
                boxShadow: `0 0 5px ${TAB_COLORS[activeTab]}`
              }} />
            </div>

            {/* Project name + member stack */}
            <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {loading ? (
                <div style={{ width: 90, height: 12, borderRadius: 5, background: 'rgba(255,255,255,0.06)', animation: 'shimmer 1.4s ease-in-out infinite' }} />
              ) : (
                <h1 style={{
                  fontSize: '0.83rem', fontWeight: 700, color: '#ededf0',
                  margin: 0, letterSpacing: '-0.015em',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200,
                  textTransform: 'capitalize'
                }}>
                  {projectData?.name || 'Project'}
                </h1>
              )}
              <MemberStack members={projectData?.users || []} total={projectData?.users?.length || 0} />
            </div>
          </div>

          {/* ❷ CENTER ZONE — Tab switcher (desktop) */}
          <div className="hidden md:flex" style={{ flexShrink: 0 }}>
            <TabSwitcher
              tabs={tabs}
              activeTab={activeTab}
              onChange={setActiveTab}
              statusColors={TAB_COLORS}
            />
          </div>

          {/* ❸ RIGHT ZONE — Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flex: 1, justifyContent: 'flex-end' }}>

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
            <NavIconBtn icon="ri-group-line" label="Team" onClick={() => setIsTeamOpen(true)} className="lg:hidden" />

            {/* AI — mobile */}
            <NavIconBtn icon="ri-robot-2-line" label="AI Chat" onClick={() => setIsAiOpen(true)} className="lg:hidden" />

            {/* AI toggle — desktop */}
            <NavIconBtn
              icon="ri-robot-2-line"
              label={isDesktopAiOpen ? 'Hide AI Panel' : 'Show AI Panel'}
              onClick={() => setIsDesktopAiOpen(v => !v)}
              active={isDesktopAiOpen}
              className="hidden lg:flex"
            />
          </div>
        </div>

        {/* ── MOBILE Tab row ── */}
        <div className="md:hidden" style={{
          display: 'flex', borderTop: '1px solid rgba(255,255,255,0.055)',
        }}>
          {tabs.map(tab => {
            const active = activeTab === tab.id;
            const color = TAB_COLORS[tab.id];
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '7px 0 8px', gap: 2, border: 'none', cursor: 'pointer',
                  background: 'none', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s',
                  color: active ? '#e4e4e7' : '#35353f',
                  borderBottom: active ? `2px solid ${color}` : '2px solid transparent',
                  borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                }}
              >
                <i className={tab.icon} style={{ fontSize: 15 }}></i>
                <span style={{ fontSize: '0.58rem', fontWeight: active ? 700 : 400, letterSpacing: '0.01em' }}>{tab.label}</span>
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
        <aside className="hidden lg:flex" style={{
          flexDirection: 'column', width: 210, flexShrink: 0,
          background: '#0b0b12', borderRight: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.64rem', fontWeight: 700, color: '#2e2e3c', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Team</span>
            <NavIconBtn icon="ri-user-add-line" label="Invite" onClick={() => setIsInviteOpen(true)} />
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '6px 7px' }}>
            {projectData?.users?.map((u, idx) => (
              <motion.div key={u._id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.04 }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 7px', borderRadius: 9, cursor: 'default', transition: 'background 0.12s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Avatar user={u} size={26} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '0.72rem', fontWeight: 600, color: '#c0c0cc', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.displayName || u.email?.split('@')[0]}</p>
                  <p style={{ fontSize: '0.61rem', color: '#2e2e3c', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</p>
                </div>
              </motion.div>
            ))}
            {(!projectData?.users || projectData.users.length === 0) && (
              <div style={{ textAlign: 'center', padding: '22px 8px' }}>
                <i className="ri-team-line" style={{ fontSize: 22, color: '#1a1a24', display: 'block', marginBottom: 6 }}></i>
                <p style={{ fontSize: '0.68rem', color: '#22222c', margin: 0 }}>No members yet</p>
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
              <motion.div key="files" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }} style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: 240, flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.05)', overflowY: 'auto' }}>
                  <FileManager projectId={currentProjectId} onFileSelect={setSelectedFile} />
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}><CodeEditor selectedFile={selectedFile} /></div>
              </motion.div>
            )}
            {activeTab === 'editor' && (
              <motion.div key="editor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }} style={{ flex: 1, overflow: 'hidden' }}>
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
            <motion.aside className="hidden lg:flex" key="ai-sidebar"
              initial={{ width: 0, opacity: 0 }} animate={{ width: 340, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ flexDirection: 'column', flexShrink: 0, background: '#0b0b12', borderLeft: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
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
          <div className="lg:hidden" style={{ position: 'fixed', inset: 0, zIndex: 40 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsTeamOpen(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }} />
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: 272, background: '#0b0b12', borderRight: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '14px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontWeight: 700, color: '#f4f4f5', margin: 0, fontSize: '0.86rem' }}>Team Members</h2>
                <NavIconBtn icon="ri-close-line" label="Close" onClick={() => setIsTeamOpen(false)} />
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                {projectData?.users?.map(u => (
                  <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 8px', borderRadius: 9 }}>
                    <Avatar user={u} size={30} />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#d4d4d8', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.displayName || u.email?.split('@')[0]}</p>
                      <p style={{ fontSize: '0.64rem', color: '#52525b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button onClick={() => { setIsTeamOpen(false); setIsInviteOpen(true); }} style={{
                  width: '100%', padding: '10px', borderRadius: 10,
                  background: 'linear-gradient(135deg,#4f46e5,#6366f1)', color: '#fff',
                  fontSize: '0.78rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  fontFamily: "'DM Sans', sans-serif", boxShadow: '0 3px 12px rgba(99,102,241,0.3)'
                }}>
                  <i className="ri-user-add-line"></i> Invite Members
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAiOpen && (
          <div className="lg:hidden" style={{ position: 'fixed', inset: 0, zIndex: 40 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsAiOpen(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }} />
            <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: '100%', maxWidth: 380, background: '#0b0b12', borderLeft: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column' }}>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(12px)', padding: 16 }}
            onClick={e => e.target === e.currentTarget && setIsInviteOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.94, y: 14 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 14 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              style={{ background: '#0d0d16', borderRadius: 16, border: '1px solid rgba(255,255,255,0.09)', width: '100%', maxWidth: 428, boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}>
              <div style={{ padding: '16px 17px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f4f4f5', margin: '0 0 2px' }}>Invite Members</h2>
                  <p style={{ fontSize: '0.68rem', color: '#52525b', margin: 0 }}>Select users to add to this project</p>
                </div>
                <NavIconBtn icon="ri-close-line" label="Close" onClick={() => { setIsInviteOpen(false); setSelectedUsers(new Set()); }} />
              </div>
              <div style={{ maxHeight: 264, overflowY: 'auto', padding: '8px 10px' }}>
                {users.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '26px 0' }}>
                    <i className="ri-user-search-line" style={{ fontSize: 24, color: '#27272a', display: 'block', marginBottom: 6 }}></i>
                    <p style={{ fontSize: '0.74rem', color: '#3f3f46', margin: 0 }}>No other users found</p>
                  </div>
                ) : users.map(u => {
                  const alreadyMember = projectData?.users?.some(m => m._id === u._id);
                  const isSelected = selectedUsers.has(u._id);
                  return (
                    <label key={u._id} style={{
                      display: 'flex', alignItems: 'center', gap: 9, padding: '8px 9px', borderRadius: 10,
                      cursor: alreadyMember ? 'not-allowed' : 'pointer', opacity: alreadyMember ? 0.4 : 1,
                      marginBottom: 3, background: isSelected ? 'rgba(99,102,241,0.08)' : 'transparent',
                      border: `1px solid ${isSelected ? 'rgba(99,102,241,0.22)' : 'transparent'}`, transition: 'all 0.12s'
                    }}>
                      <div style={{
                        width: 16, height: 16, borderRadius: 5, flexShrink: 0, transition: 'all 0.12s',
                        background: isSelected ? '#6366f1' : 'rgba(255,255,255,0.06)',
                        border: `1.5px solid ${isSelected ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {isSelected && <i className="ri-check-line" style={{ fontSize: 9, color: '#fff' }}></i>}
                        <input type="checkbox" checked={isSelected} disabled={alreadyMember}
                          onChange={() => {
                            if (alreadyMember) return;
                            const next = new Set(selectedUsers);
                            next.has(u._id) ? next.delete(u._id) : next.add(u._id);
                            setSelectedUsers(next);
                          }} style={{ display: 'none' }} />
                      </div>
                      <Avatar user={u} size={28} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '0.76rem', fontWeight: 600, color: '#d4d4d8', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.displayName || u.email?.split('@')[0]}</p>
                        <p style={{ fontSize: '0.63rem', color: '#52525b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</p>
                      </div>
                      {alreadyMember && <span style={{ fontSize: '0.6rem', fontWeight: 600, color: '#22c55e', background: 'rgba(34,197,94,0.1)', padding: '2px 7px', borderRadius: 20, flexShrink: 0 }}>Member</span>}
                    </label>
                  );
                })}
              </div>
              <div style={{ padding: '12px 13px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8 }}>
                <button onClick={() => { setIsInviteOpen(false); setSelectedUsers(new Set()); }}
                  style={{ flex: 1, padding: '9px', borderRadius: 9, background: 'rgba(255,255,255,0.05)', color: '#71717a', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', fontSize: '0.76rem', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                  Cancel
                </button>
                <button onClick={addUsers} disabled={selectedUsers.size === 0} style={{
                  flex: 1, padding: '9px', borderRadius: 9, border: 'none',
                  cursor: selectedUsers.size > 0 ? 'pointer' : 'not-allowed',
                  background: selectedUsers.size > 0 ? 'linear-gradient(135deg,#4f46e5,#6366f1)' : 'rgba(255,255,255,0.05)',
                  color: selectedUsers.size > 0 ? '#fff' : '#3f3f46',
                  fontSize: '0.76rem', fontWeight: 600, transition: 'all 0.18s', fontFamily: "'DM Sans', sans-serif",
                  boxShadow: selectedUsers.size > 0 ? '0 2px 12px rgba(99,102,241,0.28)' : 'none'
                }}>
                  {selectedUsers.size > 0 ? `Add ${selectedUsers.size} Member${selectedUsers.size > 1 ? 's' : ''}` : 'Select Members'}
                </button>
              </div>
            </motion.div>
          </motion.div>
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