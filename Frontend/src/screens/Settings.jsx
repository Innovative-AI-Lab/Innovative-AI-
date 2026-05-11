import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowLeft, 
  FiUser, 
  FiSettings, 
  FiShield, 
  FiCpu, 
  FiBell, 
  FiUsers, 
  FiCheck, 
  FiCamera, 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiLoader, 
  FiChevronRight,
  FiLayout,
  FiMoon,
  FiSmartphone,
  FiCreditCard,
  FiMenu,
  FiX
} from 'react-icons/fi';
import { UserContext } from '../context/UserContext';
import api from '../config/axios';

const TABS = [
  { id: 'profile',     label: 'Account Profile', icon: <FiUser />,      color: 'text-amber-500',   bg: 'bg-amber-500/10' },
  { id: 'preferences', label: 'Appearance',      icon: <FiLayout />,    color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'ai',          label: 'AI Studio',       icon: <FiCpu />,       color: 'text-indigo-500',  bg: 'bg-indigo-500/10' },
  { id: 'security',    label: 'Security',        icon: <FiShield />,    color: 'text-red-500',     bg: 'bg-red-500/10' },
  { id: 'notifications',label: 'Notifications',  icon: <FiBell />,      color: 'text-pink-500',    bg: 'bg-pink-500/10' },
  { id: 'collaboration',label: 'Team Members',   icon: <FiUsers />,     color: 'text-blue-500',    bg: 'bg-blue-500/10' },
  { id: 'billing',     label: 'Subscription',    icon: <FiCreditCard />, color: 'text-purple-500',  bg: 'bg-purple-500/10' },
];

const DEFAULT_SETTINGS = {
  theme: 'dark',
  fontSize: 14,
  autoSave: true,
  aiAssistance: true,
  compactView: false,
  inlineSuggestions: true,
  errorExplain: true,
  notifications: { email: true, push: true, updates: false },
  aiModel: 'gemini-1.5-flash',
  role: 'developer'
};

/* ─────────────────────────────────────────────
   REUSABLE UI COMPONENTS
───────────────────────────────────────────── */

const SectionTitle = ({ title, subtitle }) => (
  <div className="mb-6 md:mb-8">
    <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">{title}</h2>
    {subtitle && <p className="text-xs md:text-sm text-gray-500 mt-1">{subtitle}</p>}
  </div>
);

const SettingCard = ({ children, className = "" }) => (
  <div className={`bg-white/[0.03] border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6 ${className}`}>
    {children}
  </div>
);

const FormInput = ({ label, icon, ...props }) => (
  <div className="space-y-2">
    {label && <label className="text-[10px] md:text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">{label}</label>}
    <div className="relative group">
      {icon && <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-amber-500 transition-colors">{icon}</div>}
      <input
        {...props}
        className={`w-full bg-black/20 border border-white/5 rounded-lg md:rounded-xl py-2.5 md:py-3 ${icon ? 'pl-10 md:pl-11' : 'px-3 md:px-4'} pr-4 text-xs md:text-sm text-white outline-none focus:border-amber-500/40 focus:ring-4 focus:ring-amber-500/5 transition-all`}
      />
    </div>
  </div>
);

const ToggleSwitch = ({ checked, onChange, label, desc, color = "bg-amber-500" }) => (
  <div className="flex items-center justify-between py-2 gap-4">
    <div className="min-w-0">
      <p className="text-xs md:text-sm font-semibold text-gray-200 truncate">{label}</p>
      {desc && <p className="text-[10px] md:text-[12px] text-gray-500 leading-tight">{desc}</p>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-8 md:w-10 h-4 md:h-5 rounded-full transition-colors shrink-0 ${checked ? color : 'bg-white/10'}`}
    >
      <motion.div
        animate={{ x: checked ? (window.innerWidth < 768 ? 16 : 22) : 2 }}
        className="absolute top-0.5 md:top-1 w-3 h-3 rounded-full bg-white shadow-lg"
      />
    </button>
  </div>
);

/* ─────────────────────────────────────────────
   TAB PANELS
───────────────────────────────────────────── */

const ProfilePanel = ({ data, setData }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 md:space-y-8">
    <SectionTitle title="Account Profile" subtitle="Manage your public identity and personal details." />
    
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-6 p-4 md:p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl md:rounded-[24px]">
      <div className="relative group shrink-0">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl overflow-hidden border-2 border-amber-500/30">
          <img
            src={data.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.displayName || data.email)}&background=f59e0b&color=000&size=128&bold=true`}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        </div>
        <button className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 w-6 h-6 md:w-8 md:h-8 bg-amber-500 rounded-lg md:rounded-xl flex items-center justify-center text-black shadow-lg hover:scale-110 active:scale-95 transition-all">
          <FiCamera size={window.innerWidth < 768 ? 10 : 14} />
        </button>
      </div>
      <div className="text-center sm:text-left min-w-0 flex-1">
        <h3 className="text-base md:text-lg font-bold text-white leading-tight truncate">{data.displayName || 'No Name Set'}</h3>
        <p className="text-xs md:text-sm text-gray-500 mt-1 truncate">{data.email}</p>
        <div className="flex justify-center sm:justify-start gap-2 mt-3">
          <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-500 text-[9px] font-bold uppercase rounded border border-amber-500/20">Developer</span>
          <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-bold uppercase rounded border border-emerald-500/20">Active</span>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <FormInput 
        label="Display Name" 
        value={data.displayName} 
        onChange={(e) => setData({...data, displayName: e.target.value})}
        placeholder="Enter your name"
      />
      <FormInput 
        label="Professional Title" 
        value={data.settings?.role} 
        onChange={(e) => setData({...data, settings: {...data.settings, role: e.target.value}})}
        placeholder="e.g. Frontend Architect"
      />
    </div>

    <div className="space-y-2">
      <label className="text-[10px] md:text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">About Bio</label>
      <textarea
        value={data.bio}
        onChange={(e) => setData({...data, bio: e.target.value})}
        placeholder="Write a short bio..."
        className="w-full bg-black/20 border border-white/5 rounded-xl p-3 md:p-4 text-xs md:text-sm text-white outline-none focus:border-amber-500/40 min-h-[100px] md:min-h-[120px] resize-none"
      />
    </div>
  </motion.div>
);

const AppearancePanel = ({ settings, setSettings }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 md:space-y-8">
    <SectionTitle title="Appearance" subtitle="Customize the visual experience of the AI Studio." />
    
    <SettingCard>
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
            <FiMoon size={window.innerWidth < 768 ? 16 : 20} />
          </div>
          <div className="min-w-0">
            <p className="text-xs md:text-sm font-bold text-white truncate">Interface Theme</p>
            <p className="text-[10px] md:text-xs text-gray-500 truncate">Switch modes</p>
          </div>
        </div>
        <select 
          value={settings.theme}
          onChange={(e) => setSettings({...settings, theme: e.target.value})}
          className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[10px] md:text-xs text-white outline-none shrink-0"
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
          <option value="system">Auto</option>
        </select>
      </div>
      
      <div className="space-y-4 pt-6 border-t border-white/5">
        <ToggleSwitch 
          label="Auto-Save Changes" 
          desc="Saves automatically" 
          checked={settings.autoSave} 
          onChange={(val) => setSettings({...settings, autoSave: val})}
          color="bg-emerald-500"
        />
        <ToggleSwitch 
          label="Compact View" 
          desc="Reduce spacing" 
          checked={settings.compactView} 
          onChange={(val) => setSettings({...settings, compactView: val})}
          color="bg-emerald-500"
        />
      </div>
    </SettingCard>
  </motion.div>
);

const AISettingsPanel = ({ settings, setSettings }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 md:space-y-8">
    <SectionTitle title="AI Preferences" subtitle="Configure intelligent models." />
    
    <SettingCard className="border-indigo-500/20 bg-indigo-500/[0.02]">
      <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-indigo-500 flex items-center justify-center text-black shadow-lg shadow-indigo-500/20 shrink-0">
          <FiCpu size={window.innerWidth < 768 ? 20 : 24} />
        </div>
        <div className="min-w-0">
          <h4 className="text-sm md:text-base font-bold text-white truncate">Gemini 1.5 Pro</h4>
          <p className="text-[10px] md:text-xs text-indigo-400 truncate">Current active model</p>
        </div>
      </div>

      <div className="space-y-5 md:space-y-6">
        <ToggleSwitch 
          label="Context-Aware AI" 
          desc="Analyzes entire project" 
          checked={settings.aiAssistance} 
          onChange={(val) => setSettings({...settings, aiAssistance: val})}
          color="bg-indigo-500"
        />
        <ToggleSwitch 
          label="Inline Suggestions" 
          desc="Code completions" 
          checked={settings.inlineSuggestions} 
          onChange={(val) => setSettings({...settings, inlineSuggestions: val})}
          color="bg-indigo-500"
        />
        <ToggleSwitch 
          label="Error Explain" 
          desc="Auto explanations" 
          checked={settings.errorExplain} 
          onChange={(val) => setSettings({...settings, errorExplain: val})}
          color="bg-indigo-500"
        />
      </div>
    </SettingCard>
  </motion.div>
);

const SecurityPanel = () => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 md:space-y-8">
    <SectionTitle title="Security" subtitle="Secure your credentials." />
    <div className="max-w-md space-y-4 md:space-y-6">
      <FormInput label="Current Password" type="password" icon={<FiLock />} />
      <FormInput label="New Password" type="password" icon={<FiShield />} />
      <FormInput label="Confirm New Password" type="password" icon={<FiShield />} />
      <button className="w-full py-2.5 md:py-3 bg-red-600 hover:bg-red-500 text-white text-xs md:text-sm font-bold rounded-lg md:rounded-xl transition-all flex items-center justify-center gap-2">
        <FiShield /> Update Password
      </button>
    </div>
  </motion.div>
);

/* ─────────────────────────────────────────────
   MAIN SCREEN
───────────────────────────────────────────── */

const Settings = () => {
  const { user, setUser, updateUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState(null);
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/login'); return; }
    if (!user) {
      api.get('/users/profile').then(res => {
        const u = res.data.data.user || res.data.user;
        setUser(u);
        initForm(u);
      }).catch(() => navigate('/login'));
    } else {
      initForm(user);
    }
  }, [user, navigate]);

  const initForm = (u) => {
    setFormData({
      displayName: u.displayName || '',
      email: u.email || '',
      bio: u.bio || '',
      photoURL: u.photoURL || '',
      settings: { ...DEFAULT_SETTINGS, ...(u.settings || {}) },
    });
  };

  const handleSave = async () => {
    setStatus({ type: 'loading', message: 'Saving...' });
    try {
      const res = await api.put('/users/profile', {
        displayName: formData.displayName,
        bio: formData.bio,
        photoURL: formData.photoURL,
        settings: formData.settings
      });
      updateUser(res.data.data.user || res.data.user);
      setStatus({ type: 'success', message: 'Saved' });
    } catch (err) {
      setStatus({ type: 'error', message: 'Error' });
    } finally {
      setTimeout(() => setStatus({ type: 'idle', message: '' }), 3000);
    }
  };

  if (!formData) return (
    <div className="h-screen bg-black flex items-center justify-center">
      <FiLoader className="text-amber-500 animate-spin" size={30} />
    </div>
  );

  const activeTabData = TABS.find(t => t.id === activeTab);

  return (
    <div className="h-screen bg-[#08080a] text-white flex flex-col font-['Syne',sans-serif] overflow-hidden">
      
      {/* HEADER */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-8 bg-[#0a0a0c]/80 backdrop-blur-xl shrink-0 z-50">
        <div className="flex items-center gap-3 md:gap-6">
          <button 
            className="lg:hidden p-2 text-gray-500 hover:text-white"
            onClick={() => setIsSidebarOpen(true)}
          >
            <FiMenu size={20} />
          </button>
          <button onClick={() => navigate(-1)} className="hidden sm:flex p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-all">
            <FiArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-amber-500 flex items-center justify-center text-black shrink-0">
              <FiSettings size={14} md:size={16} />
            </div>
            <h1 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.15em] md:tracking-[0.2em] truncate max-w-[120px] sm:max-w-none">
              Settings
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <AnimatePresence>
            {status.message && (
              <motion.span 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                className={`hidden sm:inline text-[10px] font-bold uppercase ${status.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}
              >
                {status.message}
              </motion.span>
            )}
          </AnimatePresence>
          <button 
            onClick={handleSave}
            disabled={status.type === 'loading'}
            className="px-4 md:px-6 py-1.5 md:py-2 bg-white text-black text-[10px] md:text-xs font-bold rounded-lg hover:bg-amber-500 transition-all flex items-center gap-2 shadow-lg shadow-white/5 disabled:bg-gray-800 disabled:text-gray-500 whitespace-nowrap"
          >
            {status.type === 'loading' ? <FiLoader className="animate-spin" /> : <FiCheck />}
            <span className="hidden xs:inline">Commit Changes</span>
            <span className="xs:hidden">Save</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* SIDEBAR - MOBILE DRAWER */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
          )}
        </AnimatePresence>

        <aside className={`
          fixed lg:static inset-y-0 left-0 w-64 lg:w-72 bg-[#0a0a0c] lg:bg-[#0a0a0c]/40 border-r border-white/5 
          transition-transform duration-300 z-[70] lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          flex flex-col p-4 shrink-0
        `}>
          <div className="flex items-center justify-between mb-6 px-4 lg:hidden">
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Navigation</p>
            <button onClick={() => setIsSidebarOpen(false)} className="text-gray-500"><FiX size={20} /></button>
          </div>
          
          <div className="hidden lg:block mb-6 px-4">
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Configuration</p>
          </div>

          <nav className="space-y-1 overflow-y-auto custom-scrollbar flex-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all group ${activeTab === tab.id ? 'bg-white/5 text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0 ${activeTab === tab.id ? tab.bg + ' ' + tab.color : 'bg-transparent'}`}>
                  {tab.icon}
                </div>
                <span className={`text-sm font-bold tracking-tight ${activeTab === tab.id ? 'translate-x-1' : ''} transition-transform`}>{tab.label}</span>
                {activeTab === tab.id && <FiChevronRight className="ml-auto text-gray-600 hidden lg:block" size={14} />}
              </button>
            ))}
          </nav>

          <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-amber-500/5 to-transparent border border-white/5 shrink-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
              <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Storage</p>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full w-[45%] bg-amber-500 rounded-full" />
            </div>
          </div>
        </aside>

        {/* CONTENT PANEL */}
        <main className="flex-1 bg-[#0d0d0f] relative overflow-y-auto custom-scrollbar">
          <div className="max-w-4xl mx-auto px-4 py-8 md:p-12 lg:px-24 pb-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'profile' && <ProfilePanel data={formData} setData={setFormData} />}
                {activeTab === 'preferences' && <AppearancePanel settings={formData.settings} setSettings={(s) => setFormData({...formData, settings: s})} />}
                {activeTab === 'ai' && <AISettingsPanel settings={formData.settings} setSettings={(s) => setFormData({...formData, settings: s})} />}
                {activeTab === 'security' && <SecurityPanel />}
                
                {['notifications', 'collaboration', 'billing'].includes(activeTab) && (
                  <div className="h-full flex flex-col items-center justify-center py-16 md:py-24 text-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-white/5 flex items-center justify-center text-gray-600 mb-4 md:mb-6">
                      {TABS.find(t => t.id === activeTab).icon}
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-white mb-2 tracking-tight">Feature in Development</h3>
                    <p className="text-xs md:text-sm text-gray-500 max-w-[280px] md:max-w-sm mx-auto">This module is coming soon in the next major update.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
        @media (min-width: 768px) { .custom-scrollbar::-webkit-scrollbar { width: 6px; } }
      `}</style>
    </div>
  );
};

export default Settings;