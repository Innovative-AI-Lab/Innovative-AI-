import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NAV_LINKS, BRAND_INFO } from './Navlinks';
import { MdOutlineChevronLeft } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ activeId, onLogout, displayName, onNewProject }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleToggle = () => setIsCollapsed(!isCollapsed);

  const handleNavigate = (item) => {
    if (item.id === 'logout') {
      onLogout();
    } else if (item.id === 'dashboard') {
      navigate('/');
    } else {
      navigate(`/${item.id}`);
    }
  };

  const mainLinks = NAV_LINKS.filter(link => link.section === 'main');
  const secondaryLinks = NAV_LINKS.filter(link => link.section === 'secondary');

  const NavItem = ({ item, isActive, onClick, isCollapsed }) => (
    <motion.button
      onClick={onClick}
      className={`flex items-center gap-3 w-full h-10 px-3.5 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'bg-white/[0.08] text-zinc-100'
          : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100'
      }`}
      whileTap={{ scale: 0.97 }}
    >
      <span className="text-xl">{item.icon}</span>
      <AnimatePresence>
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0, marginLeft: 0 }}
            animate={{ opacity: 1, width: 'auto', marginLeft: 8 }}
            exit={{ opacity: 0, width: 0, marginLeft: 0 }}
            transition={{ duration: 0.2 }}
            className="whitespace-nowrap"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 80 : 256 }}
      className="relative flex flex-col h-screen bg-[#0a0b0f] border-r border-white/[0.06] transition-all duration-300 ease-in-out"
    >
      {/* Toggle Button */}
      <button
        onClick={handleToggle}
        className="absolute top-1/2 -right-3.5 transform -translate-y-1/2 w-7 h-7 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-700 hover:text-white transition-all z-10"
      >
        <MdOutlineChevronLeft
          className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Brand */}
      <div className="flex items-center gap-3 p-4">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-sm font-bold text-white">
          {BRAND_INFO.shortName}
        </div>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-lg font-bold text-zinc-100 tracking-tight">{BRAND_INFO.name}</h1>
              <p className="text-[10px] text-zinc-500 -mt-0.5">{BRAND_INFO.tagline}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* New Project Button */}
      <div className="p-4">
        <button
          onClick={onNewProject}
          className={`w-full flex items-center justify-center gap-1.5 h-10 px-3.5 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-sm font-semibold shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_28px_rgba(139,92,246,0.45)] hover:-translate-y-px active:translate-y-0 transition-all ${isCollapsed ? 'px-0' : ''}`}
        >
          <span className="text-lg">＋</span>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                New Project
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col p-4 space-y-2">
        {mainLinks.map(item => (
          <NavItem
            key={item.id}
            item={item}
            isActive={activeId === item.id}
            onClick={() => handleNavigate(item)}
            isCollapsed={isCollapsed}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
            {(displayName || 'U')[0].toUpperCase()}
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="overflow-hidden"
              >
                <p className="text-sm font-semibold text-zinc-100 leading-tight">{displayName}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-4 space-y-2">
          {secondaryLinks.map(item => (
            <NavItem
              key={item.id}
              item={item}
              isActive={activeId === item.id}
              onClick={() => handleNavigate(item)}
              isCollapsed={isCollapsed}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
