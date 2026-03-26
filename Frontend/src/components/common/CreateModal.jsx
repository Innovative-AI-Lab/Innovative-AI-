import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../../config/axios';
import { BRAND } from '../../constants';

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

export default CreateModal;