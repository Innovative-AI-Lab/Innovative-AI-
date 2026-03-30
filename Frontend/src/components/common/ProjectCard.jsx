import React from 'react';
import { motion } from 'framer-motion';
import { PROJECT_ACCENTS } from '../../constants';

function ProjectCard({
  project,
  index,
  isOwner,
  onProjectClick,
  onEdit,
  onAddMember,
  onDelete,
  deletingId
}) {
  
  const g = PROJECT_ACCENTS[index % PROJECT_ACCENTS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className="group relative rounded-2xl border border-white/[0.07] hover:border-white/[0.14] bg-[#0e1017] hover:bg-[#13161f] p-5 overflow-hidden transition-all duration-200 hover:shadow-2xl hover:shadow-black/40"
    >
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${g.bar}`} />
      <div className={`w-9 h-9 rounded-xl ${g.icon} flex items-center justify-center text-base mb-3`}>📁</div>
      <h3 className="text-[13px] font-bold text-zinc-100 truncate mb-1 capitalize tracking-tight">{project.name}</h3>
      <p className="text-[11px] text-zinc-500 font-mono mb-3">{project.users?.length || 0} member{project.users?.length !== 1 ? 's' : ''}</p>

      {/* Members */}
      <div className="flex -space-x-1.5 mb-4">
        {project.users?.slice(0, 4).map((u) => (
          <div key={u._id} title={u.displayName || u.email}
            className={`w-[22px] h-[22px] rounded-full border border-[#0e1017] flex items-center justify-center text-[8px] font-bold text-white bg-gradient-to-br ${g.av}`}>
            {(u.displayName || u.email || 'U')[0].toUpperCase()}
          </div>
        ))}
        {(project.users?.length || 0) > 4 && (
          <div className="w-[22px] h-[22px] rounded-full bg-zinc-800 border border-[#0e1017] flex items-center justify-center text-[8px] font-bold text-zinc-400">
            +{project.users.length - 4}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onProjectClick(project)}
          className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold ${g.text} border border-current/20 hover:bg-white/[0.05] transition-all`}
        >
          Open →
        </button>
        {isOwner && (
          <>
            <button
              onClick={onEdit}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-zinc-400 border border-white/[0.08] hover:border-white/[0.15] hover:text-zinc-200 transition-all"
              title="Edit project"
            >
              ✏️
            </button>
            <button
              onClick={onAddMember}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-zinc-400 border border-white/[0.08] hover:border-white/[0.15] hover:text-zinc-200 transition-all"
              title="Add member"
            >
              👤+
            </button>
            <button
              onClick={onDelete}
              disabled={deletingId === project._id}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-red-400/60 border border-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all disabled:opacity-40"
              title="Delete project"
            >
              {deletingId === project._id ? '…' : '🗑'}
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}

export default ProjectCard;