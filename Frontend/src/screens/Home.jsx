import React, { useContext, useState, useEffect, useCallback } from 'react';
import { UserContext } from '../context/user.context';
import axios from '../config/axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';

/* ─── Toast ─── */
function Toast({ toasts }) {
  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 60, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold border
              ${t.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}
          >
            <span>{t.type === 'error' ? '✕' : '✓'}</span>
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ─── Skeleton Card ─── */
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-indigo-100/60 p-5 animate-pulse shadow-sm" style={{ background: 'rgba(255,255,255,0.55)' }}>
      <div className="flex justify-between mb-4">
        <div className="w-11 h-11 rounded-xl bg-gray-200" />
        <div className="w-14 h-5 rounded-full bg-gray-200" />
      </div>
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-1/3 mb-5" />
      <div className="flex justify-between items-center">
        <div className="flex -space-x-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-7 h-7 rounded-full bg-gray-200 border-2 border-white" />
          ))}
        </div>
        <div className="w-12 h-3 rounded bg-gray-200" />
      </div>
    </div>
  );
}

/* ─── Project Card ─── */
const cardGradients = [
  { from: '#6366f1', to: '#8b5cf6', light: '#ede9fe', text: '#5b21b6' },
  { from: '#f43f5e', to: '#ec4899', light: '#fce7f3', text: '#9d174d' },
  { from: '#f59e0b', to: '#f97316', light: '#fef3c7', text: '#92400e' },
  { from: '#06b6d4', to: '#0ea5e9', light: '#e0f2fe', text: '#0c4a6e' },
  { from: '#10b981', to: '#059669', light: '#d1fae5', text: '#064e3b' },
  { from: '#8b5cf6', to: '#6366f1', light: '#ede9fe', text: '#4c1d95' },
];

function ProjectCard({ project, onClick, index }) {
  const g = cardGradients[index % cardGradients.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative rounded-2xl border border-indigo-100/70 hover:border-transparent hover:shadow-2xl p-5 cursor-pointer transition-all duration-300 overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.60)', backdropFilter: 'blur(10px)' }}
    >
      {/* Top color bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${g.from}, ${g.to})` }}
      />

      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
        style={{ background: `linear-gradient(135deg, ${g.from}08, ${g.to}05)` }}
      />

      <div className="flex items-start justify-between mb-4 mt-1">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200"
          style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }}
        >
          <i className="ri-folder-3-fill text-white text-lg"></i>
        </div>
        <span
          className="text-[11px] px-2.5 py-1 rounded-full font-semibold"
          style={{ background: g.light, color: g.text }}
        >
          Active
        </span>
      </div>

      <h3 className="text-[15px] font-bold text-gray-800 mb-1 capitalize truncate">
        {project.name}
      </h3>
      <p className="text-xs text-gray-400 mb-5">
        {project.users?.length || 0} member{project.users?.length !== 1 ? 's' : ''}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {project.users?.slice(0, 4).map((u, i) => (
            <div
              key={i}
              title={u.displayName || u.email}
              className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold shadow-sm"
              style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }}
            >
              {(u.displayName || u.email || 'U')[0].toUpperCase()}
            </div>
          ))}
          {(project.users?.length || 0) > 4 && (
            <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-500">
              +{project.users.length - 4}
            </div>
          )}
        </div>
        <span
          className="text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all duration-200"
          style={{ color: g.from }}
        >
          Open <i className="ri-arrow-right-line text-xs"></i>
        </span>
      </div>
    </motion.div>
  );
}

/* ─── Create Modal ─── */
function CreateModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError('');
    setLoading(true);
    axios.post('/projects/create', { name: name.trim().toLowerCase() })
      .then(res => { onCreated(res.data); onClose(); })
      .catch(err => setError(err.response?.data?.message || err.response?.data || 'Failed to create project'))
      .finally(() => setLoading(false));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-indigo-100/60"
        style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)' }}
      >
        {/* Modal header gradient bar */}
        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)' }} />

        <div className="px-6 pt-5 pb-4 border-b border-indigo-100/50 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">New Project</h2>
            <p className="text-xs text-gray-400 mt-0.5">Name saved in lowercase automatically</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-indigo-50 flex items-center justify-center text-gray-400 hover:text-indigo-600 transition-colors border border-gray-200"
          >
            <i className="ri-close-line text-base"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-widest">
              Project Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              placeholder="e.g. my-awesome-app"
              autoFocus
              className="w-full px-4 py-3 rounded-xl text-sm text-gray-800 border border-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all placeholder-gray-300"
              style={{ background: 'rgba(238,240,255,0.6)' }}
            />
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-red-500 mt-2 flex items-center gap-1.5"
                >
                  <i className="ri-error-warning-line"></i> {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-indigo-600 border border-indigo-200 hover:bg-indigo-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="ri-loader-4-line animate-spin"></i> Creating…
                </span>
              ) : 'Create Project'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Home ─── */
const Home = () => {
  const { user, setUser } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [toasts, setToasts] = useState([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  /* OAuth callback */
  useEffect(() => {
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');
    if (token && userStr) {
      try {
        const oauthUser = JSON.parse(decodeURIComponent(userStr));
        localStorage.setItem('token', token);
        setUser(oauthUser);
        window.history.replaceState({}, '', '/');
        addToast('Signed in successfully!');
      } catch (e) { console.error(e); }
    }
  }, []);

  /* Fetch projects */
  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/login'); return; }
    setFetching(true);
    axios.get('/projects/all')
      .then(res => setProjects(res.data.projects || []))
      .catch(() => addToast('Failed to load projects.', 'error'))
      .finally(() => setFetching(false));
  }, [user]);

  const handleProjectCreated = (newProject) => {
    setProjects(prev => [...prev, newProject]);
    addToast(`Project "${newProject.name}" created!`);
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Developer';
  const totalMembers = projects.reduce((t, p) => t + (p.users?.length || 0), 0);

  const stats = [
    {
      label: 'Total Projects',
      value: projects.length,
      icon: 'ri-folder-3-fill',
      gradient: 'from-indigo-500 to-violet-500',
      bg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      border: 'border-indigo-100',
    },
    {
      label: 'Collaborators',
      value: totalMembers,
      icon: 'ri-team-fill',
      gradient: 'from-pink-500 to-rose-500',
      bg: 'bg-pink-50',
      iconColor: 'text-pink-600',
      border: 'border-pink-100',
    },
    {
      label: 'AI Status',
      value: 'Online',
      icon: 'ri-robot-2-fill',
      gradient: 'from-emerald-500 to-teal-500',
      bg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      border: 'border-emerald-100',
      isOnline: true,
    },
  ];

  const features = [
    { icon: 'ri-robot-2-fill', title: 'AI Assistant', desc: 'Intelligent code generation & answers', color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
    { icon: 'ri-code-s-slash-fill', title: 'Code Editor', desc: 'Syntax highlighting, multi-language', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { icon: 'ri-message-3-fill', title: 'Team Chat', desc: 'Real-time collaboration', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { icon: 'ri-terminal-box-fill', title: 'Terminal', desc: 'Integrated shell & commands', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #eef0ff 0%, #f3eeff 40%, #fce8f6 70%, #ede9fe 100%)' }}>

      {/* Decorative blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-40"
          style={{ background: 'radial-gradient(circle, #a78bfa 0%, transparent 70%)' }} />
        <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)' }} />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
      </div>

      <Header />

      <main className="flex-1 relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Welcome Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative mb-8 rounded-3xl overflow-hidden shadow-xl"
        >
          {/* Gradient background */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 35%, #a21caf 65%, #db2777 100%)'
          }} />
          {/* Shine overlay */}
          <div className="absolute inset-0 opacity-20"
            style={{ background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)' }} />
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/10" />

          <div className="relative px-6 py-7 sm:px-8 sm:py-8 flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/25 backdrop-blur-sm border border-white/30 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0 shadow-lg">
              {displayName[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">Welcome back 👋</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">{displayName}</h1>
              <p className="text-white/70 text-sm mt-1">Ready to build something extraordinary today?</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex-shrink-0 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 border border-white/30"
              style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', color: '#fff' }}
            >
              <i className="ri-add-line text-base"></i>
              New Project
            </button>
          </div>
        </motion.div>

        {/* ── Stats ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          {stats.map((s, i) => (
            <div
              key={i}
              className={`rounded-2xl border ${s.border} px-5 py-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow`}
              style={{ background: 'rgba(255,255,255,0.60)', backdropFilter: 'blur(12px)' }}
            >
              <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <i className={`${s.icon} text-xl ${s.iconColor}`}></i>
              </div>
              <div>
                {s.isOnline ? (
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <p className="text-xl font-extrabold text-gray-800">{s.value}</p>
                  </div>
                ) : (
                  <p className="text-2xl font-extrabold text-gray-800">{s.value}</p>
                )}
                <p className="text-xs text-gray-400 font-medium mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Projects Section ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.18 }}
          className="rounded-3xl border border-indigo-100/60 shadow-sm overflow-hidden mb-6"
          style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(16px)' }}
        >
          {/* Section header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-indigo-100/50">
            <div>
              <h2 className="text-base font-bold text-gray-800">Your Projects</h2>
              <p className="text-xs text-gray-400 mt-0.5">Click any project to open workspace</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all active:translate-y-0"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
            >
              <i className="ri-add-line"></i> New Project
            </button>
          </div>

          <div className="p-6">
            {fetching ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : projects.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-20 h-20 rounded-3xl border border-indigo-200/60 flex items-center justify-center mb-5 shadow-sm" style={{ background: 'rgba(99,102,241,0.10)' }}>
                  <i className="ri-folder-add-line text-3xl text-indigo-400"></i>
                </div>
                <h3 className="text-base font-bold text-gray-700 mb-2">No projects yet</h3>
                <p className="text-sm text-gray-400 mb-6 max-w-xs">
                  Create your first project and start collaborating with your team.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                >
                  Create your first project
                </button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project, i) => (
                  <ProjectCard
                    key={project._id}
                    project={project}
                    index={i}
                    onClick={() => navigate(`/project/${project._id}`, { state: { project } })}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Feature Cards ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.26 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {features.map((f, i) => (
            <div
              key={i}
              className={`rounded-2xl border ${f.border} px-4 py-5 hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-default`}
              style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(12px)' }}
            >
              <div className={`w-10 h-10 ${f.bg} rounded-xl flex items-center justify-center mb-3`}>
                <i className={`${f.icon} text-lg ${f.color}`}></i>
              </div>
              <h3 className="text-sm font-bold text-gray-800 mb-1">{f.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </motion.div>

      </main>

      <Footer />

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <CreateModal
            onClose={() => setIsModalOpen(false)}
            onCreated={handleProjectCreated}
          />
        )}
      </AnimatePresence>

      {/* Toasts */}
      <Toast toasts={toasts} />
    </div>
  );
};

export default Home;
