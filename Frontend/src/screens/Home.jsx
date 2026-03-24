import React, { useContext, useState, useEffect, useCallback, useRef } from 'react';
import { UserContext } from '../context/user.context';
import axios from '../config/axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import io from 'socket.io-client';

// ─────────────────────────────────────────────────────────────────────────────
// BRAND CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const BRAND = {
  name:      'Innovative AI',
  shortName: 'IAI',
  tagline:   'Build smarter. Ship faster.',
};

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const PROJECT_ACCENTS = [
  { bar: 'from-violet-500 to-purple-500', icon: 'bg-violet-500/10', text: 'text-violet-400', av: 'from-violet-500 to-purple-500'   },
  { bar: 'from-pink-500 to-rose-500',     icon: 'bg-pink-500/10',   text: 'text-pink-400',   av: 'from-pink-500 to-rose-500'        },
  { bar: 'from-cyan-400 to-sky-500',      icon: 'bg-cyan-500/10',   text: 'text-cyan-400',   av: 'from-cyan-400 to-sky-500'         },
  { bar: 'from-amber-400 to-orange-500',  icon: 'bg-amber-500/10',  text: 'text-amber-400',  av: 'from-amber-400 to-orange-500'     },
  { bar: 'from-emerald-400 to-teal-500',  icon: 'bg-emerald-500/10',text: 'text-emerald-400',av: 'from-emerald-400 to-teal-500'     },
  { bar: 'from-indigo-500 to-violet-500', icon: 'bg-indigo-500/10', text: 'text-indigo-400', av: 'from-indigo-500 to-violet-500'    },
];

// ─────────────────────────────────────────────────────────────────────────────
// NAV CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '⬡', section: 'Workspace', badge: null  },
  { id: 'projects',  label: 'Projects',  icon: '◻', section: 'Workspace', badge: null  },
  { id: 'ai-studio', label: 'AI Studio', icon: '◈', section: 'Workspace', badge: 'NEW' },
  { id: 'activity',  label: 'Activity',  icon: '◷', section: 'Workspace', badge: null  },
  { id: 'terminal',  label: 'Terminal',  icon: '⌨', section: 'Tools',     badge: null  },
  { id: 'editor',    label: 'Editor',    icon: '✦', section: 'Tools',     badge: null  },
  { id: 'team-chat', label: 'Team Chat', icon: '◎', section: 'Tools',     badge: null  },
  { id: 'settings',  label: 'Settings',  icon: '◱', section: 'Account',   badge: null  },
  { id: 'docs',      label: 'Docs',      icon: '⊹', section: 'Account',   badge: null  },
];

// ─────────────────────────────────────────────────────────────────────────────
// PAGE TRANSITION WRAPPER
// ─────────────────────────────────────────────────────────────────────────────
function PageView({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0  }}
      exit={{    opacity: 0, y: -6 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TOAST SYSTEM
// ─────────────────────────────────────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div className="fixed top-5 right-5 z-[200] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 48, scale: 0.92 }}
            animate={{ opacity: 1, x: 0,  scale: 1    }}
            exit={{    opacity: 0, x: 48, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold shadow-2xl backdrop-blur-sm
              ${t.type === 'error'
                ? 'bg-red-950/90 border-red-800/50 text-red-300'
                : 'bg-zinc-900/90 border-zinc-700/50 text-zinc-100'}`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold
              ${t.type === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              {t.type === 'error' ? '✕' : '✓'}
            </span>
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON CARD
// ─────────────────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 animate-pulse">
      <div className="w-9 h-9 rounded-xl bg-white/[0.06] mb-4" />
      <div className="h-3.5 bg-white/[0.06] rounded-lg w-2/3 mb-2.5" />
      <div className="h-2.5 bg-white/[0.04] rounded-lg w-1/3 mb-5" />
      <div className="flex gap-1">
        {[0, 1, 2].map(i => <div key={i} className="w-6 h-6 rounded-full bg-white/[0.06]" />)}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROJECT CARD
// ─────────────────────────────────────────────────────────────────────────────
function ProjectCard({ project, index, onClick }) {
  const g = PROJECT_ACCENTS[index % PROJECT_ACCENTS.length];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      whileHover={{ y: -4, transition: { duration: 0.18 } }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative rounded-2xl border border-white/[0.07] hover:border-white/[0.14]
        bg-[#0e1017] hover:bg-[#13161f] p-5 cursor-pointer overflow-hidden
        transition-all duration-200 hover:shadow-2xl hover:shadow-black/40"
    >
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${g.bar}`} />
      <div className={`w-9 h-9 rounded-xl ${g.icon} flex items-center justify-center text-base mb-4 group-hover:scale-110 transition-transform duration-200`}>
        📁
      </div>
      <h3 className="text-[13px] font-bold text-zinc-100 truncate mb-1 capitalize tracking-tight">
        {project.name}
      </h3>
      <p className="text-[11px] text-zinc-500 font-mono mb-4">
        {project.users?.length || 0} member{project.users?.length !== 1 ? 's' : ''}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex -space-x-1.5">
          {project.users?.slice(0, 4).map((u, i) => (
            <div
              key={i}
              title={u.displayName || u.email}
              className={`w-[22px] h-[22px] rounded-full border border-[#0e1017] flex items-center justify-center text-[8px] font-bold text-white bg-gradient-to-br ${g.av}`}
            >
              {(u.displayName || u.email || 'U')[0].toUpperCase()}
            </div>
          ))}
          {(project.users?.length || 0) > 4 && (
            <div className="w-[22px] h-[22px] rounded-full bg-zinc-800 border border-[#0e1017] flex items-center justify-center text-[8px] font-bold text-zinc-400">
              +{project.users.length - 4}
            </div>
          )}
        </div>
        <span className={`text-[11px] font-semibold ${g.text} flex items-center gap-1 group-hover:gap-2 transition-all duration-200`}>
          Open <span>→</span>
        </span>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE PROJECT MODAL
// ─────────────────────────────────────────────────────────────────────────────
function CreateModal({ onClose, onCreated }) {
  const [name, setName]       = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    if (!name.trim()) return;
    setError('');
    setLoading(true);
    axios.post('/projects/create', { name: name.trim().toLowerCase() })
      .then(res  => { onCreated(res.data); onClose(); })
      .catch(err => setError(err.response?.data?.message || 'Failed to create project'))
      .finally(() => setLoading(false));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{    opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 16 }}
        animate={{ scale: 1,    opacity: 1, y: 0  }}
        exit={{    scale: 0.94, opacity: 0, y: 16 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="w-full max-w-md rounded-2xl border border-white/[0.09] bg-[#0e1017] shadow-2xl overflow-hidden"
      >
        <div className="h-px w-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500" />
        <div className="px-6 pt-5 pb-4 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-zinc-100 tracking-tight">New Project</h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">Powered by {BRAND.name}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.05] flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-all"
          >✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-[10px] font-semibold text-zinc-500 mb-2 uppercase tracking-widest">
              Project Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              placeholder="e.g. my-awesome-app"
              autoFocus
              className="w-full px-4 py-3 rounded-xl text-sm text-zinc-100 font-mono border border-white/[0.08] focus:border-violet-500/60 bg-white/[0.04] outline-none focus:ring-1 focus:ring-violet-500/30 placeholder-zinc-600 transition-all"
            />
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0  }}
                  exit={{    opacity: 0        }}
                  className="text-[11px] text-red-400 mt-2"
                >
                  ⚠ {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-zinc-400 border border-white/[0.08] hover:border-white/[0.15] hover:text-zinc-200 hover:bg-white/[0.04] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20 transition-all"
            >
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating…
                  </span>
                : 'Create Project'
              }
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADD MEMBER MODAL
// ─────────────────────────────────────────────────────────────────────────────
function AddMemberModal({ project, onClose, onAdded, addToast }) {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    if (!email.trim()) return;
    setError('');
    setLoading(true);
    axios.put('/projects/add-user', { projectId: project._id, email: email.trim() })
      .then(res => {
        onAdded(res.data.project);
        addToast(`${email} added to "${project.name}"`);
        onClose();
      })
      .catch(err => setError(err.response?.data?.message || 'User not found'))
      .finally(() => setLoading(false));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{    opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 16 }}
        animate={{ scale: 1,    opacity: 1, y: 0  }}
        exit={{    scale: 0.94, opacity: 0, y: 16 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="w-full max-w-md rounded-2xl border border-white/[0.09] bg-[#0e1017] shadow-2xl overflow-hidden"
      >
        <div className="h-px w-full bg-gradient-to-r from-pink-500 via-violet-500 to-cyan-500" />
        <div className="px-6 pt-5 pb-4 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-zinc-100 tracking-tight">Add Member</h2>
            <p className="text-[11px] text-zinc-500 mt-0.5 font-mono capitalize">{project.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg border border-white/[0.08] hover:bg-white/[0.05] flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-all">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-[10px] font-semibold text-zinc-500 mb-2 uppercase tracking-widest">User Email</label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              placeholder="colleague@example.com"
              autoFocus
              className="w-full px-4 py-3 rounded-xl text-sm text-zinc-100 border border-white/[0.08] focus:border-violet-500/60 bg-white/[0.04] outline-none focus:ring-1 focus:ring-violet-500/30 placeholder-zinc-600 transition-all"
            />
            <AnimatePresence>
              {error && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[11px] text-red-400 mt-2">
                  ⚠ {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-zinc-400 border border-white/[0.08] hover:border-white/[0.15] hover:text-zinc-200 hover:bg-white/[0.04] transition-all">Cancel</button>
            <button type="submit" disabled={!email.trim() || loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20 transition-all">
              {loading
                ? <span className="flex items-center justify-center gap-2"><span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Adding…</span>
                : 'Add Member'
              }
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ████  PAGE VIEWS  ████
// ─────────────────────────────────────────────────────────────────────────────

/* ── 1. DASHBOARD ──────────────────────────────────────────────────────────── */
function DashboardView({ projects, fetching, displayName, onOpenModal, onOpenProject, totalMembers }) {
  const features = [
    { icon: '🤖', label: 'AI Assistant', desc: 'Context-aware code generation & answers',   bg: 'bg-violet-500/10'  },
    { icon: '✦',  label: 'Code Editor',  desc: 'Syntax highlighting across 40+ languages',  bg: 'bg-cyan-500/10'    },
    { icon: '◎',  label: 'Team Chat',    desc: 'Real-time collaboration with presence',     bg: 'bg-emerald-500/10' },
    { icon: '⌨',  label: 'Terminal',     desc: 'Integrated shell with full command access', bg: 'bg-amber-500/10'   },
  ];

  return (
    <PageView>
      <div className="space-y-7">

        {/* ── Welcome Banner ── */}
        <div className="relative rounded-2xl overflow-hidden border border-violet-500/20 p-7">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-pink-500/8" />
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
          <div className="absolute -top-16 -right-8 w-48 h-48 rounded-full bg-violet-500/15 blur-2xl pointer-events-none" />
          <div className="relative flex flex-wrap items-center gap-5">
            <div className="w-[52px] h-[52px] rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xl font-bold text-white flex-shrink-0 shadow-[0_0_32px_rgba(139,92,246,0.4)]">
              {displayName[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-1">👋 Welcome back</p>
              <h1 className="text-2xl font-extrabold tracking-tight leading-none bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                {displayName}
              </h1>
              <p className="text-sm text-zinc-500 mt-1.5">
                {projects.length} project{projects.length !== 1 ? 's' : ''} · {totalMembers} collaborator{totalMembers !== 1 ? 's' : ''} · <span className="text-emerald-400">AI online</span>
              </p>
            </div>
            <button
              onClick={onOpenModal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 hover:border-violet-500/50 hover:-translate-y-0.5 transition-all"
            >
              <span>＋</span> New Project
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: '📁', value: projects.length, label: 'Total Projects', trend: '+2 this week', pulse: false },
            { icon: '👥', value: totalMembers,    label: 'Collaborators',  trend: '+3 new',       pulse: false },
            { icon: '🤖', value: 'Online',        label: 'AI Status',      trend: '99.9% uptime', pulse: true  },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0  }}
              transition={{ delay: 0.08 * i }}
              className="flex items-center gap-4 p-5 rounded-2xl bg-[#0e1017] border border-white/[0.07] hover:border-white/[0.12] hover:-translate-y-1 transition-all cursor-default"
            >
              <div className="w-11 h-11 rounded-xl bg-white/[0.05] flex items-center justify-center text-xl flex-shrink-0">
                {s.icon}
              </div>
              <div>
                {s.pulse
                  ? <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inset-0 rounded-full bg-emerald-400 opacity-60" />
                        <span className="relative rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                      <span className="text-lg font-bold text-emerald-400">{s.value}</span>
                    </div>
                  : <p className="text-2xl font-extrabold text-zinc-100 tracking-tight leading-none">{s.value}</p>
                }
                <p className="text-[11px] text-zinc-500 font-medium mt-1 uppercase tracking-wider">{s.label}</p>
                <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">↑ {s.trend}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Recent Projects ── */}
        <div>
          <h2 className="text-[14px] font-bold text-zinc-100 tracking-tight mb-1">Recent Projects</h2>
          <p className="text-[11px] text-zinc-600 mb-4">Your latest {BRAND.name} workspaces</p>
          {fetching
            ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
              </div>
            : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.slice(0, 3).map((p, i) => (
                  <ProjectCard key={p._id} project={p} index={i} onClick={() => onOpenProject(p)} />
                ))}
              </div>
          }
        </div>

        {/* ── Platform Features ── */}
        <div>
          <h2 className="text-[14px] font-bold text-zinc-100 tracking-tight mb-4">Platform Features</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0  }}
                transition={{ delay: 0.3 + i * 0.06 }}
                className="rounded-2xl border border-white/[0.07] hover:border-white/[0.13] bg-[#0e1017] hover:bg-[#13161f] px-4 py-5 hover:-translate-y-1 transition-all cursor-default"
              >
                <div className={`w-9 h-9 rounded-xl ${f.bg} flex items-center justify-center text-base mb-3`}>{f.icon}</div>
                <h3 className="text-[13px] font-bold text-zinc-100 mb-1.5 tracking-tight">{f.label}</h3>
                <p className="text-[11px] text-zinc-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </PageView>
  );
}

/* ── 2. PROJECTS ───────────────────────────────────────────────────────────── */
function ProjectsView({ projects, fetching, onOpenModal, onOpenProject, onProjectUpdated, addToast }) {
  const [search, setSearch]           = useState('');
  const [addMemberFor, setAddMemberFor] = useState(null); // project object
  const [deletingId, setDeletingId]   = useState(null);

  const filtered = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = (e, project) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
    setDeletingId(project._id);
    axios.delete(`/projects/${project._id}`)
      .then(() => {
        onProjectUpdated(projects.filter(p => p._id !== project._id));
        addToast(`"${project.name}" deleted`);
      })
      .catch(() => addToast('Failed to delete project', 'error'))
      .finally(() => setDeletingId(null));
  };

  return (
    <PageView>
      <div className="space-y-5">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-zinc-100 tracking-tight">All Projects</h2>
            <p className="text-[12px] text-zinc-600 mt-0.5">{projects.length} total · {BRAND.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search projects…"
              className="h-8 px-3 rounded-lg text-sm text-zinc-300 bg-white/[0.05] border border-white/[0.08] focus:border-violet-500/50 outline-none placeholder-zinc-600 w-44 transition-all"
            />
            <button
              onClick={onOpenModal}
              className="flex items-center gap-1.5 h-8 px-3.5 rounded-lg text-[12px] font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-md shadow-violet-500/20 transition-all"
            >
              <span>＋</span> New
            </button>
          </div>
        </div>

        {/* Grid */}
        {fetching
          ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
            </div>
          : filtered.length === 0
            ? <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-white/[0.08] text-center">
                <div className="text-4xl mb-4">📂</div>
                <h3 className="text-[14px] font-bold text-zinc-300 mb-2">
                  {search ? 'No results found' : 'No projects yet'}
                </h3>
                <p className="text-[12px] text-zinc-600 mb-6 max-w-xs">
                  {search ? `No match for "${search}"` : 'Create your first project to get started.'}
                </p>
                {!search && (
                  <button onClick={onOpenModal} className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:-translate-y-0.5 transition-all">
                    Create your first project
                  </button>
                )}
              </div>
            : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((p, i) => {
                  const g = PROJECT_ACCENTS[i % PROJECT_ACCENTS.length];
                  return (
                    <motion.div
                      key={p._id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0  }}
                      transition={{ duration: 0.3, delay: i * 0.06 }}
                      className="group relative rounded-2xl border border-white/[0.07] hover:border-white/[0.14] bg-[#0e1017] hover:bg-[#13161f] p-5 overflow-hidden transition-all duration-200 hover:shadow-2xl hover:shadow-black/40"
                    >
                      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${g.bar}`} />
                      <div className={`w-9 h-9 rounded-xl ${g.icon} flex items-center justify-center text-base mb-3`}>📁</div>
                      <h3 className="text-[13px] font-bold text-zinc-100 truncate mb-1 capitalize tracking-tight">{p.name}</h3>
                      <p className="text-[11px] text-zinc-500 font-mono mb-3">{p.users?.length || 0} member{p.users?.length !== 1 ? 's' : ''}</p>

                      {/* Members */}
                      <div className="flex -space-x-1.5 mb-4">
                        {p.users?.slice(0, 4).map((u, idx) => (
                          <div key={idx} title={u.displayName || u.email}
                            className={`w-[22px] h-[22px] rounded-full border border-[#0e1017] flex items-center justify-center text-[8px] font-bold text-white bg-gradient-to-br ${g.av}`}>
                            {(u.displayName || u.email || 'U')[0].toUpperCase()}
                          </div>
                        ))}
                        {(p.users?.length || 0) > 4 && (
                          <div className="w-[22px] h-[22px] rounded-full bg-zinc-800 border border-[#0e1017] flex items-center justify-center text-[8px] font-bold text-zinc-400">
                            +{p.users.length - 4}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => onOpenProject(p)}
                          className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold ${g.text} border border-current/20 hover:bg-white/[0.05] transition-all`}
                        >
                          Open →
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); setAddMemberFor(p); }}
                          className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-zinc-400 border border-white/[0.08] hover:border-white/[0.15] hover:text-zinc-200 transition-all"
                          title="Add member"
                        >
                          👤+
                        </button>
                        <button
                          onClick={e => handleDelete(e, p)}
                          disabled={deletingId === p._id}
                          className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-red-400/60 border border-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all disabled:opacity-40"
                          title="Delete project"
                        >
                          {deletingId === p._id ? '…' : '🗑'}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}

                {/* New project tile */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={onOpenModal}
                  className="rounded-2xl border border-dashed border-white/[0.08] hover:border-violet-500/30 hover:bg-violet-500/[0.03] flex flex-col items-center justify-center gap-2 min-h-[160px] cursor-pointer transition-all text-zinc-600 hover:text-violet-400"
                >
                  <span className="text-2xl">＋</span>
                  <span className="text-[12px] font-medium">New Project</span>
                </motion.div>
              </div>
        }
      </div>

      {/* Add Member Modal */}
      <AnimatePresence>
        {addMemberFor && (
          <AddMemberModal
            project={addMemberFor}
            onClose={() => setAddMemberFor(null)}
            onAdded={updatedProject => {
              onProjectUpdated(projects.map(p => p._id === updatedProject._id ? updatedProject : p));
            }}
            addToast={addToast}
          />
        )}
      </AnimatePresence>
    </PageView>
  );
}

/* ── 3. AI STUDIO ──────────────────────────────────────────────────────────── */
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

/* ── 4. ACTIVITY ───────────────────────────────────────────────────────────── */
function ActivityView({ projects, displayName }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/activity/recent?hours=48')
      .then(res => {
        if (res.data.success) {
          setActivities(res.data.activities);
        }
      })
      .catch(err => console.error('Failed to load activities:', err))
      .finally(() => setLoading(false));
  }, []);

  // Fallback static items if no activities
  const staticItems = [
    { icon: '🤖', text: `${BRAND.name} AI is online and ready`,        time: 'Always',    col: 'text-cyan-400'   },
    { icon: '💬', text: 'Team Chat is live in your workspace',          time: 'Active',    col: 'text-emerald-400'},
    { icon: '✦',  text: 'Code Editor session available',                time: 'Ready',     col: 'text-amber-400'  },
    { icon: '⚡', text: 'Terminal connected',                            time: 'Connected', col: 'text-zinc-400'   },
  ];

  const dynamicItems = activities.slice(0, 8).map(activity => ({
    icon: getActivityIcon(activity.action),
    text: activity.description,
    time: formatTimeAgo(activity.timestamp),
    col: getActivityColor(activity.action)
  }));

  const allItems = dynamicItems.length > 0 ? dynamicItems : staticItems;

  function getActivityIcon(action) {
    const icons = {
      'created_project': '📁',
      'joined_project': '👥',
      'sent_message': '💬',
      'ai_chat': '🤖',
      'code_generated': '✦',
      'settings_updated': '◱',
      'login': '🔑',
      'logout': '🚪'
    };
    return icons[action] || '📝';
  }

  function getActivityColor(action) {
    const colors = {
      'created_project': 'text-violet-400',
      'joined_project': 'text-emerald-400',
      'sent_message': 'text-blue-400',
      'ai_chat': 'text-cyan-400',
      'code_generated': 'text-amber-400',
      'settings_updated': 'text-pink-400',
      'login': 'text-green-400',
      'logout': 'text-red-400'
    };
    return colors[action] || 'text-zinc-400';
  }

  function formatTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }

  return (
    <PageView>
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Activity Feed</h2>
          <p className="text-[12px] text-zinc-600 mt-0.5">Everything happening in your {BRAND.name} workspace</p>
        </div>
        <div className="rounded-2xl border border-white/[0.07] bg-[#0e1017] overflow-hidden divide-y divide-white/[0.04]">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="w-9 h-9 rounded-xl bg-white/[0.05] animate-pulse" />
                <div className="flex-1">
                  <div className="h-3 bg-white/[0.05] rounded w-3/4 mb-1 animate-pulse" />
                  <div className="h-2 bg-white/[0.03] rounded w-1/4 animate-pulse" />
                </div>
                <div className="h-3 bg-white/[0.05] rounded w-12 animate-pulse" />
              </div>
            ))
          ) : (
            allItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0  }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.03] transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-white/[0.05] flex items-center justify-center text-base flex-shrink-0">
                  {item.icon}
                </div>
                <span className="flex-1 text-[13px] text-zinc-300">{item.text}</span>
                <span className={`text-[11px] font-mono flex-shrink-0 ${item.col}`}>{item.time}</span>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </PageView>
  );
}

/* ── 5. TERMINAL ───────────────────────────────────────────────────────────── */
function TerminalView({ displayName }) {
  const [history, setHistory] = useState([
    { type: 'system', text: `${BRAND.name} Terminal v1.0.0 — Ready` },
    { type: 'system', text: 'Type "help" to see available commands.' },
  ]);
  const [input, setInput]   = useState('');
  const [cmdHistory, setCmdHistory] = useState([]);
  const [cmdIndex, setCmdIndex]     = useState(-1);
  const bottomRef = useRef(null);

  const COMMANDS = {
    help:   () => ['Commands: help, clear, ls, whoami, date, pwd, echo [text], projects'],
    clear:  () => { setHistory([{ type: 'system', text: 'Terminal cleared.' }]); return []; },
    ls:     () => ['projects/  docs/  assets/  config/  .env'],
    whoami: () => [`${displayName} · ${BRAND.name} User · Pro Plan`],
    date:   () => [new Date().toString()],
    pwd:    () => ['/home/innovative-ai/workspace'],
    echo:   args => [args.join(' ')],
    projects: () => ['Use "Projects" tab to manage your workspaces.'],
    version:  () => [`${BRAND.name} Terminal v1.0.0`],
  };

  const run = e => {
    if (e.key === 'ArrowUp') {
      const idx = Math.min(cmdIndex + 1, cmdHistory.length - 1);
      setCmdIndex(idx);
      setInput(cmdHistory[idx] || '');
      return;
    }
    if (e.key === 'ArrowDown') {
      const idx = Math.max(cmdIndex - 1, -1);
      setCmdIndex(idx);
      setInput(idx === -1 ? '' : cmdHistory[idx] || '');
      return;
    }
    if (e.key !== 'Enter' || !input.trim()) return;

    const [cmd, ...args] = input.trim().split(' ');
    const lines = [{ type: 'input', text: `$ ${input}` }];
    setCmdHistory(prev => [input, ...prev]);
    setCmdIndex(-1);

    if (COMMANDS[cmd]) {
      const out = COMMANDS[cmd](args);
      if (out?.length) out.forEach(t => lines.push({ type: 'output', text: t }));
    } else {
      lines.push({ type: 'error', text: `command not found: ${cmd}` });
    }
    setInput('');
    setHistory(prev => [...prev, ...lines]);
  };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [history]);

  return (
    <PageView>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-xl">⌨</div>
          <div>
            <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Terminal</h2>
            <p className="text-[12px] text-zinc-600">{BRAND.name} · Integrated shell</p>
          </div>
          <span className="ml-auto text-[11px] text-zinc-500 font-mono">↑↓ for history</span>
        </div>
        <div className="rounded-2xl border border-white/[0.07] bg-[#050608] overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-[#0a0b0f]">
            <span className="w-3 h-3 rounded-full bg-red-500/70" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <span className="w-3 h-3 rounded-full bg-green-500/70" />
            <span className="mx-auto text-[11px] text-zinc-600 font-mono">{BRAND.name} — bash</span>
          </div>
          <div className="h-80 overflow-y-auto p-5 font-mono text-[12px] space-y-1">
            {history.map((line, i) => (
              <div key={i} className={
                line.type === 'system' ? 'text-violet-400' :
                line.type === 'input'  ? 'text-emerald-400' :
                line.type === 'error'  ? 'text-red-400' :
                'text-zinc-300'
              }>{line.text}</div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="border-t border-white/[0.06] flex items-center px-5 py-3 gap-2">
            <span className="text-emerald-400 font-mono text-[12px]">$</span>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={run}
              placeholder="Type a command…"
              autoFocus
              className="flex-1 bg-transparent text-zinc-200 font-mono text-[12px] outline-none placeholder-zinc-700"
            />
          </div>
        </div>
      </div>
    </PageView>
  );
}

/* ── 6. EDITOR ─────────────────────────────────────────────────────────────── */
function EditorView() {
  const [code, setCode] = useState(
`// ${BRAND.name} — Code Editor
// Start writing your code here

function greet(name) {
  return \`Hello from ${BRAND.name}, \${name}!\`;
}

const result = greet('Developer');
console.log(result);
`);
  const [output, setOutput]   = useState('');
  const [running, setRunning] = useState(false);
  const [filename, setFilename] = useState('main.js');

  const runCode = () => {
    setRunning(true);
    setOutput('');
    setTimeout(() => {
      try {
        const logs = [];
        const mockConsole = { log: (...args) => logs.push(args.map(String).join(' ')) };
        // eslint-disable-next-line no-new-func
        new Function('console', code)(mockConsole);
        setOutput(logs.join('\n') || '✓ Ran successfully (no output)');
      } catch (err) {
        setOutput(`Error: ${err.message}`);
      }
      setRunning(false);
    }, 300);
  };

  const lines = code.split('\n');

  return (
    <PageView>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-xl">✦</div>
            <div>
              <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Code Editor</h2>
              <input
                value={filename}
                onChange={e => setFilename(e.target.value)}
                className="text-[12px] text-zinc-500 bg-transparent outline-none border-b border-transparent focus:border-zinc-600 mt-0.5"
              />
            </div>
          </div>
          <button
            onClick={runCode}
            disabled={running}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 disabled:opacity-40 transition-all"
          >
            {running ? '⏳ Running…' : '▶ Run'}
          </button>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-[#050608] overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.06] bg-[#0a0b0f]">
            <span className="text-[11px] text-zinc-500 font-mono">{filename}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-1" title="Unsaved" />
            <span className="ml-auto text-[10px] text-zinc-600">JavaScript</span>
          </div>
          <div className="flex h-72 overflow-auto">
            <div className="flex-shrink-0 px-4 py-4 text-right border-r border-white/[0.04] select-none">
              {lines.map((_, i) => (
                <div key={i} className="text-[11px] font-mono text-zinc-700 leading-6">{i + 1}</div>
              ))}
            </div>
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              spellCheck={false}
              className="flex-1 px-4 py-4 bg-transparent text-zinc-300 font-mono text-[12px] leading-6 outline-none resize-none w-full"
            />
          </div>
        </div>

        {/* Output panel */}
        {output && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-white/[0.07] bg-[#050608] p-4 font-mono text-[12px]">
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-2">Output</p>
            <pre className={`whitespace-pre-wrap ${output.startsWith('Error') ? 'text-red-400' : 'text-emerald-400'}`}>
              {output}
            </pre>
          </motion.div>
        )}
      </div>
    </PageView>
  );
}

/* ── 7. TEAM CHAT ──────────────────────────────────────────────────────────── */
function TeamChatView({ displayName, projects }) {
  const [msg, setMsg]       = useState('');
  const [activeRoom, setActiveRoom] = useState('general');
  const [chats, setChats]   = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const { user } = useContext(UserContext);

  const rooms = ['general', 'dev', 'design', ...projects.slice(0, 3).map(p => p.name)];

  // Initialize socket connection
  useEffect(() => {
    const socket = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000', {
      auth: { token: localStorage.getItem('token') }
    });
    socketRef.current = socket;

    // Join initial room
    socket.emit('join-room', activeRoom, user?._id, displayName);

    // Load initial messages
    axios.get(`/chat/messages/${activeRoom}`)
      .then(res => {
        if (res.data.success) {
          const messages = res.data.data.map(m => ({
            user: m.sender,
            text: m.text,
            time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            self: m.sender === user?._id,
            messageType: m.messageType
          }));
          setChats(prev => ({ ...prev, [activeRoom]: messages }));
        }
      })
      .catch(err => console.error('Failed to load messages:', err));

    // Socket event listeners
    socket.on('new-message', (message) => {
      const newMsg = {
        user: message.sender,
        text: message.text,
        time: new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        self: message.sender === user?._id,
        messageType: message.messageType
      };
      setChats(prev => ({
        ...prev,
        [activeRoom]: [...(prev[activeRoom] || []), newMsg]
      }));
    });

    socket.on('user-joined', (data) => {
      console.log(`${data.username} joined the room`);
    });

    socket.on('user-left', (data) => {
      console.log(`${data.username} left the room`);
    });

    socket.on('user-typing', (data) => {
      setTypingUsers(prev => [...prev.filter(u => u.userId !== data.userId), data]);
    });

    socket.on('user-stopped-typing', (data) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Handle room change
  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.emit('join-room', activeRoom, user?._id, displayName);
      
      // Load messages for new room
      if (!chats[activeRoom]) {
        axios.get(`/chat/messages/${activeRoom}`)
          .then(res => {
            if (res.data.success) {
              const messages = res.data.data.map(m => ({
                user: m.sender,
                text: m.text,
                time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                self: m.sender === user?._id,
                messageType: m.messageType
              }));
              setChats(prev => ({ ...prev, [activeRoom]: messages }));
            }
          })
          .catch(err => console.error('Failed to load messages:', err));
      }
    }
  }, [activeRoom, user?._id, displayName]);

  // Auto-scroll to bottom
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chats, activeRoom, typingUsers]);

  const send = () => {
    if (!msg.trim() || !socketRef.current) return;
    
    socketRef.current.emit('send-message', {
      roomId: activeRoom,
      message: msg,
      sender: user?._id,
      messageType: 'text'
    });
    
    setMsg('');
    socketRef.current.emit('typing-stop', { roomId: activeRoom });
    setIsTyping(false);
  };

  const handleTyping = (e) => {
    setMsg(e.target.value);
    
    if (!isTyping && e.target.value.trim()) {
      socketRef.current?.emit('typing-start', { roomId: activeRoom });
      setIsTyping(true);
    } else if (isTyping && !e.target.value.trim()) {
      socketRef.current?.emit('typing-stop', { roomId: activeRoom });
      setIsTyping(false);
    }
  };

  const currentMessages = chats[activeRoom] || [];

  return (
    <PageView>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-xl">◎</div>
          <div>
            <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Team Chat</h2>
            <p className="text-[12px] text-zinc-600">{BRAND.name} workspace</p>
          </div>
          <span className="ml-auto flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inset-0 rounded-full bg-emerald-400 opacity-60" />
              <span className="relative rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            {onlineUsers.length + 1} online
          </span>
        </div>

        <div className="flex gap-3 h-[420px]">
          {/* Room list */}
          <div className="w-36 flex-shrink-0 bg-[#0e1017] rounded-2xl border border-white/[0.07] p-2 overflow-y-auto">
            <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold px-2 mb-2">Channels</p>
            {rooms.map(room => (
              <button
                key={room}
                onClick={() => setActiveRoom(room)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-[12px] transition-all mb-0.5 truncate
                  ${activeRoom === room ? 'bg-violet-500/10 text-violet-400 font-semibold' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]'}`}
              >
                # {room}
              </button>
            ))}
          </div>

          {/* Chat area */}
          <div className="flex-1 rounded-2xl border border-white/[0.07] bg-[#0e1017] overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <p className="text-[12px] font-semibold text-zinc-300"># {activeRoom}</p>
              <p className="text-[10px] text-zinc-600">{currentMessages.length} messages</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {currentMessages.length === 0
                ? <div className="flex items-center justify-center h-full text-zinc-600 text-[13px]">No messages yet. Say hi! 👋</div>
                : currentMessages.map((c, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2.5 ${c.self ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center text-[9px] font-bold text-white bg-gradient-to-br ${c.self ? 'from-violet-500 to-purple-600' : 'from-pink-500 to-rose-500'}`}>
                      {c.user[0].toUpperCase()}
                    </div>
                    <div className={`max-w-[72%] flex flex-col gap-0.5 ${c.self ? 'items-end' : 'items-start'}`}>
                      <span className="text-[10px] text-zinc-600 font-medium">{c.user} · {c.time}</span>
                      <div className={`px-3 py-1.5 rounded-xl text-[12px] leading-relaxed
                        ${c.self ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-tr-none' : 'bg-white/[0.06] text-zinc-300 rounded-tl-none'}`}>
                        {c.text}
                      </div>
                    </div>
                  </motion.div>
                ))
              }
              
              {/* Typing indicators */}
              {typingUsers.length > 0 && (
                <div className="flex gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-[9px] text-white font-bold flex-shrink-0">○</div>
                  <div className="px-3 py-2 rounded-xl rounded-tl-none bg-white/[0.06] flex gap-1 items-center">
                    <span className="text-[11px] text-zinc-500">
                      {typingUsers.map(u => u.username).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing
                    </span>
                    {[0, 1, 2].map(i => (
                      <span key={i} className="w-1 h-1 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
              
              <div ref={bottomRef} />
            </div>
            <div className="border-t border-white/[0.06] p-3 flex gap-2">
              <input
                value={msg}
                onChange={handleTyping}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder={`Message #${activeRoom}…`}
                className="flex-1 px-3 py-2 rounded-xl text-sm text-zinc-200 bg-white/[0.05] border border-white/[0.08] focus:border-emerald-500/40 outline-none placeholder-zinc-600 transition-all"
              />
              <button
                onClick={send}
                disabled={!msg.trim()}
                className="px-3 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 disabled:opacity-30 hover:-translate-y-0.5 transition-all"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageView>
  );
}

/* ── 8. SETTINGS ───────────────────────────────────────────────────────────── */
function SettingsView({ displayName, user, addToast, onLogout }) {
  const [notif, setNotif]         = useState(true);
  const [darkMode, setDarkMode]   = useState(true);
  const [aiSuggest, setAiSuggest] = useState(true);
  const [newDisplayName, setNewDisplayName] = useState(displayName);
  const [saving, setSaving]       = useState(false);

  const saveProfile = () => {
    setSaving(true);
    axios.put('/users/profile', { displayName: newDisplayName })
      .then(() => {
        addToast('Profile updated!');
        setSaving(false);
      })
      .catch(err => {
        addToast('Failed to update profile', 'error');
        setSaving(false);
      });
  };

  const Toggle = ({ on, onToggle, label, desc }) => (
    <div className="flex items-center justify-between py-4 border-b border-white/[0.04] last:border-0">
      <div>
        <p className="text-[13px] font-semibold text-zinc-200">{label}</p>
        <p className="text-[11px] text-zinc-600 mt-0.5">{desc}</p>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-10 h-5 rounded-full transition-all duration-200 ${on ? 'bg-violet-600' : 'bg-zinc-700'}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${on ? 'left-5' : 'left-0.5'}`} />
      </button>
    </div>
  );

  return (
    <PageView>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Settings</h2>
          <p className="text-[12px] text-zinc-600 mt-0.5">Manage your {BRAND.name} preferences</p>
        </div>

        {/* Profile */}
        <div className="rounded-2xl border border-white/[0.07] bg-[#0e1017] p-6 space-y-4">
          <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Profile</h3>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xl font-bold text-white shadow-[0_0_24px_rgba(139,92,246,0.3)]">
              {displayName[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <input
                value={newDisplayName}
                onChange={e => setNewDisplayName(e.target.value)}
                className="font-bold text-zinc-100 bg-transparent border-b border-transparent focus:border-zinc-600 outline-none w-full mb-1"
              />
              <p className="text-[12px] text-zinc-500">{user?.email || 'user@innovativeai.dev'}</p>
              <p className="text-[10px] text-violet-400 font-semibold mt-0.5">Pro Plan · {BRAND.name}</p>
            </div>
          </div>
          <button
            onClick={saveProfile}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-[12px] font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-40 transition-all"
          >
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </div>

        {/* Preferences */}
        <div className="rounded-2xl border border-white/[0.07] bg-[#0e1017] px-6 py-2">
          <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest pt-4 pb-2">Preferences</h3>
          <Toggle on={notif}     onToggle={() => setNotif(v => !v)}     label="Notifications" desc="Get notified about project activity"         />
          <Toggle on={darkMode}  onToggle={() => setDarkMode(v => !v)}  label="Dark Mode"      desc="Use dark theme across the platform"          />
          <Toggle on={aiSuggest} onToggle={() => setAiSuggest(v => !v)} label="AI Suggestions" desc="Real-time code suggestions from the AI"      />
        </div>

        {/* Logout */}
        <div className="rounded-2xl border border-white/[0.07] bg-[#0e1017] p-6">
          <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Session</h3>
          <button
            onClick={onLogout}
            className="px-4 py-2 rounded-lg text-[12px] font-semibold text-zinc-300 border border-white/[0.12] hover:bg-white/[0.05] transition-all"
          >
            Sign Out
          </button>
        </div>

        {/* Danger */}
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-5">
          <h3 className="text-[11px] font-bold text-red-400 uppercase tracking-widest mb-3">Danger Zone</h3>
          <p className="text-[12px] text-zinc-500 mb-4">These actions are irreversible. Please proceed with caution.</p>
          <button className="px-4 py-2 rounded-lg text-[12px] font-semibold text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-all">
            Delete Account
          </button>
        </div>
      </div>
    </PageView>
  );
}

/* ── 9. DOCS ───────────────────────────────────────────────────────────────── */
function DocsView() {
  const docs = [
    { 
      icon: '🚀', 
      title: 'Getting Started',    
      desc: 'Set up your first project in minutes',                 
      badge: 'Beginner',
      content: 'Welcome to Innovative AI! Get started by creating your first project. Click the "New Project" button in the top right, give it a name, and start building amazing things with AI-powered development tools.'
    },
    { 
      icon: '🤖', 
      title: 'AI Studio',     
      desc: `Chat with ${BRAND.name} AI assistant`,            
      badge: 'AI',
      content: 'The AI Studio is your intelligent coding companion. Ask questions about your code, get debugging help, generate code snippets, and receive architectural advice. The AI learns from your project context.'
    },
    { 
      icon: '◎',  
      title: 'Team Chat', 
      desc: 'Real-time collaboration with your team',                
      badge: 'Collaboration',
      content: 'Team Chat enables real-time communication with your project collaborators. Create channels for different topics, mention team members, and keep everyone aligned on project progress.'
    },
    { 
      icon: '⌨',  
      title: 'Terminal', 
      desc: 'Integrated command-line interface',                     
      badge: 'Tools',
      content: 'The built-in terminal provides direct access to your development environment. Run commands, install packages, and manage your project infrastructure all from within the platform.'
    },
    { 
      icon: '✦',  
      title: 'Code Editor', 
      desc: 'Syntax-highlighted code editing',                  
      badge: 'Development',
      content: 'Write and edit code with full syntax highlighting, auto-completion, and error detection. The editor supports multiple programming languages and integrates with the AI for smart suggestions.'
    },
    { 
      icon: '◱',  
      title: 'Settings', 
      desc: 'Customize your workspace preferences',                
      badge: 'Configuration',
      content: 'Personalize your experience with theme settings, notification preferences, and AI assistance options. Update your profile and manage your account settings here.'
    },
  ];

  const [selectedDoc, setSelectedDoc] = useState(null);

  return (
    <PageView>
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">{BRAND.name} Documentation</h2>
          <p className="text-[12px] text-zinc-600 mt-0.5">Everything you need to build with {BRAND.name}</p>
        </div>
        
        {selectedDoc ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <button
              onClick={() => setSelectedDoc(null)}
              className="flex items-center gap-2 text-[12px] text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              ← Back to docs
            </button>
            <div className="rounded-2xl border border-white/[0.07] bg-[#0e1017] p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{selectedDoc.icon}</span>
                <div>
                  <h3 className="text-lg font-bold text-zinc-100">{selectedDoc.title}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 tracking-wider">{selectedDoc.badge}</span>
                </div>
              </div>
              <p className="text-[14px] text-zinc-300 leading-relaxed">{selectedDoc.content}</p>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {docs.map((d, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0  }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedDoc(d)}
                className="rounded-2xl border border-white/[0.07] hover:border-white/[0.13] bg-[#0e1017] hover:bg-[#13161f] p-5 hover:-translate-y-1 cursor-pointer transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{d.icon}</span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 tracking-wider">{d.badge}</span>
                </div>
                <h3 className="text-[13px] font-bold text-zinc-100 mb-1.5">{d.title}</h3>
                <p className="text-[11px] text-zinc-500 leading-relaxed">{d.desc}</p>
                <p className="text-[11px] text-violet-400 font-semibold mt-3">Read more →</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NAV ITEM COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function NavItem({ icon, label, badge, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ width: 'calc(100% - 16px)' }}
      className={`mx-2 flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 relative text-left
        ${active ? 'bg-violet-500/10 text-violet-400' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'}`}
    >
      {active && <span className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-[3px] h-[18px] bg-violet-500 rounded-r-full" />}
      <span className="w-4 text-center opacity-70 text-sm">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400 tracking-wide">{badge}</span>}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────
function Sidebar({ displayName, activeId, setActiveId, onLogout }) {
  const sections = [...new Set(NAV_ITEMS.map(n => n.section))];
  return (
    <aside className="hidden lg:flex flex-col w-[220px] flex-shrink-0 h-screen sticky top-0 bg-[#0b0d14] border-r border-white/[0.06] overflow-y-auto">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-[18px] border-b border-white/[0.06]">
        <div className="w-[32px] h-[32px] rounded-[10px] bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center font-bold text-white text-[10px] tracking-tight shadow-[0_0_20px_rgba(139,92,246,0.4)] flex-shrink-0">
          IAI
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-zinc-100 tracking-tight leading-tight">Innovative AI</p>
          <p className="text-[9px] text-zinc-600 leading-tight truncate">{BRAND.tagline}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 pt-4 pb-2 space-y-4">
        {sections.map(section => (
          <div key={section}>
            <p className="px-5 mb-1 text-[9px] font-semibold text-zinc-600 uppercase tracking-[0.1em]">{section}</p>
            {NAV_ITEMS.filter(n => n.section === section).map(n => (
              <NavItem key={n.id} {...n} active={activeId === n.id} onClick={() => setActiveId(n.id)} />
            ))}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-white/[0.06] p-3">
        <div
          className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-white/[0.04] cursor-pointer transition-colors group"
          onClick={onLogout}
          title="Sign out"
        >
          <div className="w-8 h-8 rounded-[9px] bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0">
            {displayName[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-zinc-200 truncate">{displayName}</p>
            <p className="text-[10px] text-zinc-500 font-mono">Pro · Innovative AI</p>
          </div>
          <span className="text-zinc-600 text-xs group-hover:text-red-400 transition-colors">⏻</span>
        </div>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TOPBAR
// ─────────────────────────────────────────────────────────────────────────────
function Topbar({ activeId, onNewProject, mobileMenuOpen, setMobileMenuOpen, notifications, unreadCount, showNotifications, setShowNotifications, addToast }) {
  const activeNav = NAV_ITEMS.find(n => n.id === activeId);

  const markAsRead = (id) => {
    axios.put(`/notifications/${id}/read`)
      .then(() => {
        // Update local state
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      })
      .catch(err => addToast('Failed to mark as read', 'error'));
  };

  const markAllAsRead = () => {
    axios.put('/notifications/read-all')
      .then(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      })
      .catch(err => addToast('Failed to mark all as read', 'error'));
  };

  return (
    <header className="sticky top-0 z-20 h-[58px] flex items-center gap-3 px-6 bg-[#07080f]/85 backdrop-blur-xl border-b border-white/[0.06]">
      <button
        onClick={() => setMobileMenuOpen(o => !o)}
        className="lg:hidden w-8 h-8 rounded-lg border border-white/[0.07] hover:bg-white/[0.05] flex items-center justify-center text-zinc-400 text-sm transition-all"
      >
        {mobileMenuOpen ? '✕' : '☰'}
      </button>

      {/* Mobile brand */}
      <div className="lg:hidden flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-[8px] font-bold text-white">IAI</div>
        <span className="text-[13px] font-bold text-zinc-200">Innovative AI</span>
      </div>

      {/* Desktop breadcrumb */}
      <div className="hidden lg:flex items-center gap-2 text-[12px]">
        <span className="text-zinc-600">Innovative AI</span>
        <span className="text-zinc-700">›</span>
        <span className="font-semibold text-zinc-300">{activeNav?.label}</span>
      </div>

      <div className="flex-1" />

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative w-8 h-8 rounded-lg border border-white/[0.07] hover:border-white/[0.14] hover:bg-white/[0.05] flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition-all text-sm"
        >
          🔔
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-violet-500 flex items-center justify-center text-[8px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Notification Dropdown */}
        <AnimatePresence>
          {showNotifications && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-10"
                onClick={() => setShowNotifications(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                className="absolute right-0 top-12 w-80 max-h-96 bg-[#0e1017] border border-white/[0.07] rounded-2xl shadow-2xl overflow-hidden z-20"
              >
                <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
                  <h3 className="text-[13px] font-bold text-zinc-100">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] text-violet-400 hover:text-violet-300 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-zinc-500 text-[12px]">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map(notification => (
                      <div
                        key={notification._id}
                        className={`p-4 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${!notification.read ? 'bg-violet-500/5' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0 mt-2" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[12px] font-semibold text-zinc-100 mb-1">{notification.title}</h4>
                            <p className="text-[11px] text-zinc-400 leading-relaxed">{notification.message}</p>
                            <p className="text-[10px] text-zinc-500 mt-2">
                              {new Date(notification.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification._id)}
                              className="text-[10px] text-violet-400 hover:text-violet-300"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <button
        onClick={onNewProject}
        className="flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-[12px] font-semibold shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_28px_rgba(139,92,246,0.45)] hover:-translate-y-px active:translate-y-0 transition-all"
      >
        <span>＋</span> New Project
      </button>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT — HOME COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const Home = () => {
  const { user, setUser }                 = useContext(UserContext);
  const [activeId, setActiveId]           = useState('dashboard');
  const [isModalOpen, setIsModalOpen]     = useState(false);
  const [projects, setProjects]           = useState([]);
  const [fetching, setFetching]           = useState(true);
  const [toasts, setToasts]               = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();

  // ── Toast helper ──
  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  // ── OAuth callback ──
  useEffect(() => {
    const token   = searchParams.get('token');
    const userStr = searchParams.get('user');
    if (token && userStr) {
      try {
        const oauthUser = JSON.parse(decodeURIComponent(userStr));
        localStorage.setItem('token', token);
        setUser(oauthUser);
        window.history.replaceState({}, '', '/');
        addToast(`Welcome to ${BRAND.name}!`);
      } catch (e) { console.error(e); }
    }
  }, []);

  // ── Fetch projects ──
  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/login'); return; }
    setFetching(true);
    axios.get('/projects/all')
      .then(res  => setProjects(res.data.projects || []))
      .catch(()  => addToast('Failed to load projects.', 'error'))
      .finally(() => setFetching(false));
  }, [user]);

  // ── Fetch notifications ──
  useEffect(() => {
    const fetchNotifications = () => {
      axios.get('/notifications?limit=10')
        .then(res => {
          if (res.data.success) {
            setNotifications(res.data.notifications);
          }
        })
        .catch(err => console.error('Failed to load notifications:', err));
      
      axios.get('/notifications/unread-count')
        .then(res => {
          if (res.data.success) {
            setUnreadCount(res.data.count);
          }
        })
        .catch(err => console.error('Failed to load unread count:', err));
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // ── Handlers ──
  const handleProjectCreated = p => {
    setProjects(prev => [...prev, p]);
    addToast(`"${p.name}" created!`);
    setActiveId('projects');
  };

  const handleOpenProject = p => navigate(`/project/${p._id}`, { state: { project: p } });

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  // ── Derived ──
  const displayName  = user?.displayName || user?.email?.split('@')[0] || 'Developer';
  const totalMembers = projects.reduce((t, p) => t + (p.users?.length || 0), 0);

  const sharedProps = {
    projects,
    fetching,
    displayName,
    onOpenModal:    () => setIsModalOpen(true),
    onOpenProject:  handleOpenProject,
    onProjectUpdated: setProjects,
    totalMembers,
    addToast,
    user,
  };

  const renderPage = () => {
    switch (activeId) {
      case 'dashboard': return <DashboardView {...sharedProps} />;
      case 'projects':  return <ProjectsView  {...sharedProps} />;
      case 'ai-studio': return <AIStudioView user={user} />;
      case 'activity':  return <ActivityView  projects={projects} displayName={displayName} />;
      case 'terminal':  return <TerminalView  displayName={displayName} />;
      case 'editor':    return <EditorView />;
      case 'team-chat': return <TeamChatView  displayName={displayName} projects={projects} />;
      case 'settings':  return <SettingsView  displayName={displayName} user={user} addToast={addToast} onLogout={handleLogout} />;
      case 'docs':      return <DocsView />;
      default:          return <DashboardView {...sharedProps} />;
    }
  };

  return (
    <div
      className="flex min-h-screen bg-[#07080f] text-zinc-100"
      style={{ fontFamily: "'Sora','Inter',system-ui,sans-serif" }}
    >
      {/* Desktop Sidebar */}
      <Sidebar
        displayName={displayName}
        activeId={activeId}
        setActiveId={id => { setActiveId(id); setMobileMenuOpen(false); }}
        onLogout={handleLogout}
      />

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="fixed left-0 top-0 z-50 lg:hidden flex flex-col w-[220px] h-screen bg-[#0b0d14] border-r border-white/[0.06] overflow-y-auto"
            >
              <div className="flex items-center justify-between px-5 py-[18px] border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <div className="w-[28px] h-[28px] rounded-[8px] bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center font-bold text-white text-[9px]">IAI</div>
                  <span className="text-[13px] font-bold text-zinc-100">Innovative AI</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="text-zinc-500 hover:text-zinc-300">✕</button>
              </div>
              <nav className="flex-1 pt-4 pb-2 space-y-4">
                {[...new Set(NAV_ITEMS.map(n => n.section))].map(section => (
                  <div key={section}>
                    <p className="px-5 mb-1 text-[9px] font-semibold text-zinc-600 uppercase tracking-[0.1em]">{section}</p>
                    {NAV_ITEMS.filter(n => n.section === section).map(n => (
                      <NavItem key={n.id} {...n} active={activeId === n.id} onClick={() => { setActiveId(n.id); setMobileMenuOpen(false); }} />
                    ))}
                  </div>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          activeId={activeId}
          onNewProject={() => setIsModalOpen(true)}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          notifications={notifications}
          unreadCount={unreadCount}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          addToast={addToast}
        />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <React.Fragment key={activeId}>
              {renderPage()}
            </React.Fragment>
          </AnimatePresence>
        </main>
      </div>

      {/* Create Project Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <CreateModal
            onClose={() => setIsModalOpen(false)}
            onCreated={handleProjectCreated}
          />
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      <Toast toasts={toasts} />
    </div>
  );
};

export default Home;