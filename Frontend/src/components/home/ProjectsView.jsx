import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../../config/axios';
import PageView from '../common/PageView';
import SkeletonCard from '../common/SkeletonCard';
import AddMemberModal from '../common/AddMemberModal';
import EditProjectModal from '../common/EditProjectModal';
import ProjectCard from '../common/ProjectCard';
import { BRAND, PROJECT_ACCENTS } from '../../constants';
import { UserContext } from '../../context/user.context';

function ProjectsView({ projects, fetching, onOpenModal, onProjectClick, onProjectUpdated, addToast }) {
  const { user: currentUser } = useContext(UserContext);
  const [search, setSearch] = useState('');
  const [addMemberFor, setAddMemberFor] = useState(null); // project object
  const [editingProject, setEditingProject] = useState(null); // project object
  const [deletingId, setDeletingId] = useState(null);

  const filtered = projects.filter(p => p && p.name && p.name.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async (e, project) => {
    e.stopPropagation();

    if (!window.confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) return;

    try {
      setDeletingId(project._id);
      const res = await axios.delete(`/projects/${project._id}`);
      const { success, data: { projectId } } = res.data;
      if (success && projectId) {
        onProjectUpdated(prev => prev.filter(p => p._id !== projectId));
      } else {
        onProjectUpdated(prev => prev.filter(p => p._id !== project._id));
      }
      addToast(`"${project.name}" deleted successfully`);

    } catch (err) {
      console.error("DELETE ERROR:", err.response?.data || err);
      addToast(err.response?.data?.message || "Failed to delete project", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleProjectUpdate = (updatedProject) => {
    if (!updatedProject || !updatedProject._id) return;
    onProjectUpdated(prev => {
        const index = prev.findIndex(p => p._id === updatedProject._id);
        if (index === -1) return prev; // Should not happen
        const newProjects = [...prev];
        newProjects[index] = { ...newProjects[index], ...updatedProject };
        return newProjects;
    });
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
        {fetching ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-white/[0.08] text-center">
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
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((p, i) => {
              const isOwner = currentUser?._id === p.owner?._id || currentUser?._id === p.owner;
              return (
                <ProjectCard
                  key={p._id}
                  project={p}
                  index={i}
                  isOwner={isOwner}
                  onProjectClick={onProjectClick}
                  onEdit={e => { e.stopPropagation(); setEditingProject(p); }}
                  onAddMember={e => { e.stopPropagation(); setAddMemberFor(p); }}
                  onDelete={e => handleDelete(e, p)}
                  deletingId={deletingId}
                />
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
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {addMemberFor && (
          <AddMemberModal
            project={addMemberFor}
            onClose={() => setAddMemberFor(null)}
            onAdded={handleProjectUpdate}
            addToast={addToast}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {editingProject && (
          <EditProjectModal
            project={editingProject}
            onClose={() => setEditingProject(null)}
            onProjectUpdated={handleProjectUpdate}
            addToast={addToast}
          />
        )}
      </AnimatePresence>
    </PageView>
  );
}

export default ProjectsView;
