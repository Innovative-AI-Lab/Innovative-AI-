import React from 'react';
import { motion } from 'framer-motion';
import { PROJECT_ACCENTS } from '../../constants';

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

export default ProjectCard;