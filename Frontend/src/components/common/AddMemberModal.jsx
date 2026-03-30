import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../../config/axios';
import { debounce } from 'lodash';

function AddMemberModal({ project, onClose, onAdded, addToast }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (query.length < 2) {
        setSearchResults([]);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`/users/search?query=${query}`);
        const filteredResults = res.data.data.users.filter(u => !project.users.map(u => u._id).includes(u._id));
        setSearchResults(filteredResults);
      } catch (err) {
        setError(err.response?.data?.message || 'Error searching users');
      } finally {
        setLoading(false);
      }
    }, 300),
    [project.users]
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => debouncedSearch.cancel();
  }, [searchQuery, debouncedSearch]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSearchQuery(user.displayName || user.email);
    setSearchResults([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) {
      setError('Please select a user to add.');
      return;
    }
    setAdding(true);
    setError('');

    try {
      const res = await axios.post(`/projects/${project._id}/add-member`, { email: selectedUser.email });
      onAdded(res.data.data);
      addToast(`${selectedUser.displayName || selectedUser.email} added to "${project.name}"`);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setAdding(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 16 }}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="relative">
            <label className="block text-[10px] font-semibold text-zinc-500 mb-2 uppercase tracking-widest">Search by Email or Name</label>
            <input
              type="text"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setSelectedUser(null); }}
              placeholder="colleague@example.com or Jane Doe"
              autoFocus
              className="w-full px-4 py-3 rounded-xl text-sm text-zinc-100 border border-white/[0.08] focus:border-violet-500/60 bg-white/[0.04] outline-none focus:ring-1 focus:ring-violet-500/30 placeholder-zinc-600 transition-all"
            />
            {loading && <div className="absolute top-10 right-3.5 w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}

            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="absolute z-10 w-full mt-2 bg-[#1c1f26] border border-white/[0.08] rounded-xl shadow-lg max-h-48 overflow-y-auto"
                >
                  {searchResults.map(user => (
                    <div
                      key={user._id}
                      onClick={() => handleSelectUser(user)}
                      className="px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/[0.05] cursor-pointer"
                    >
                      <p className="font-semibold">{user.displayName}</p>
                      <p className="text-xs text-zinc-500">{user.email}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {error && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[11px] text-red-400 mt-2">
                  ⚠ {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-zinc-400 border border-white/[0.08] hover:border-white/[0.15] hover:text-zinc-200 hover:bg-white/[0.04] transition-all">Cancel</button>
            <button type="submit" disabled={!selectedUser || adding}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20 transition-all">
              {adding
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

export default AddMemberModal;
