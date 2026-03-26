import React from 'react';
import { motion } from 'framer-motion';
import PageView from '../common/PageView';
import SkeletonCard from '../common/SkeletonCard';
import ProjectCard from '../common/ProjectCard';
import { BRAND } from '../../constants';

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

export default DashboardView;