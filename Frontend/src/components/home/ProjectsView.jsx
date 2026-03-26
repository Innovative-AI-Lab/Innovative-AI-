import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../../config/axios';
import PageView from '../common/PageView';
import SkeletonCard from '../common/SkeletonCard';
import AddMemberModal from '../common/AddMemberModal';
import { BRAND, PROJECT_ACCENTS } from '../../constants';

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

export default ProjectsView;