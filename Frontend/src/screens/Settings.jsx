import React, { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserContext } from '../context/user.context';
import { useNavigate } from 'react-router-dom';
import api from '../config/axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

/*
  ─────────────────────────────────────────────
  Add to index.html <head>:
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
  ─────────────────────────────────────────────
*/

const defaultSettings = { theme: 'dark', fontSize: 14, autoSave: true, aiAssistance: true };

const TABS = [
  { id: 'profile',     label: 'Profile',      icon: 'ri-user-3-line',         color: '#f59e0b' },
  { id: 'preferences', label: 'Preferences',  icon: 'ri-palette-line',        color: '#10b981' },
  { id: 'ai',          label: 'AI Settings',  icon: 'ri-robot-2-line',        color: '#6366f1' },
  { id: 'security',    label: 'Security',     icon: 'ri-shield-keyhole-line', color: '#ef4444' },
];

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
const T = {
  bg:         '#0d0d10',
  surface:    '#131318',
  surfaceHi:  '#1a1a22',
  border:     'rgba(255,255,255,0.07)',
  borderHi:   'rgba(255,255,255,0.13)',
  text:       '#f0f0f4',
  textMuted:  '#6b6b7a',
  textDim:    '#3a3a48',
  amber:      '#f59e0b',
  amberDim:   'rgba(245,158,11,0.12)',
  amberBorder:'rgba(245,158,11,0.25)',
};

/* ─────────────────────────────────────────────
   PRIMITIVES
───────────────────────────────────────────── */

const Label = ({ children }) => (
  <label style={{
    display: 'block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
    textTransform: 'uppercase', color: T.textMuted, marginBottom: 7,
    fontFamily: "'Geist Mono', monospace"
  }}>
    {children}
  </label>
);

const StudioInput = ({ label, error, ...props }) => (
  <div>
    {label && <Label>{label}</Label>}
    <input
      {...props}
      style={{
        width: '100%', padding: '9px 13px',
        background: T.bg, border: `1px solid ${error ? '#ef444460' : T.border}`,
        borderRadius: 9, color: T.text, fontSize: '0.83rem',
        outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
        fontFamily: "'Syne', sans-serif",
        caretColor: T.amber,
        boxSizing: 'border-box',
      }}
      onFocus={e => {
        e.target.style.borderColor = T.amberBorder;
        e.target.style.boxShadow = `0 0 0 3px ${T.amberDim}`;
      }}
      onBlur={e => {
        e.target.style.borderColor = error ? '#ef444460' : T.border;
        e.target.style.boxShadow = 'none';
      }}
    />
    {error && <p style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: 4 }}>{error}</p>}
  </div>
);

const StudioTextarea = ({ label, maxLen, value, ...props }) => (
  <div>
    {label && <Label>{label}</Label>}
    <div style={{ position: 'relative' }}>
      <textarea
        value={value}
        {...props}
        style={{
          width: '100%', padding: '10px 13px',
          background: T.bg, border: `1px solid ${T.border}`,
          borderRadius: 9, color: T.text, fontSize: '0.83rem',
          outline: 'none', resize: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
          fontFamily: "'Syne', sans-serif", lineHeight: 1.6,
          caretColor: T.amber, boxSizing: 'border-box',
          paddingBottom: 28,
        }}
        onFocus={e => { e.target.style.borderColor = T.amberBorder; e.target.style.boxShadow = `0 0 0 3px ${T.amberDim}`; }}
        onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none'; }}
      />
      {maxLen && (
        <span style={{
          position: 'absolute', bottom: 9, right: 11,
          fontSize: '0.62rem', color: (value?.length || 0) > maxLen * 0.85 ? T.amber : T.textDim,
          fontFamily: "'Geist Mono', monospace", transition: 'color 0.2s'
        }}>
          {value?.length || 0}/{maxLen}
        </span>
      )}
    </div>
  </div>
);

const StudioSelect = ({ label, value, onChange, name, options }) => (
  <div>
    {label && <Label>{label}</Label>}
    <div style={{ position: 'relative' }}>
      <select
        name={name} value={value} onChange={onChange}
        style={{
          width: '100%', padding: '9px 34px 9px 13px',
          background: T.bg, border: `1px solid ${T.border}`,
          borderRadius: 9, color: T.text, fontSize: '0.83rem',
          outline: 'none', cursor: 'pointer', appearance: 'none',
          fontFamily: "'Syne', sans-serif", transition: 'border-color 0.15s',
          boxSizing: 'border-box',
        }}
        onFocus={e => { e.target.style.borderColor = T.amberBorder; }}
        onBlur={e => { e.target.style.borderColor = T.border; }}
      >
        {options.map(o => <option key={o.value} value={o.value} style={{ background: T.surface }}>{o.label}</option>)}
      </select>
      <i className="ri-arrow-down-s-line" style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, fontSize: 16, pointerEvents: 'none' }}></i>
    </div>
  </div>
);

const Toggle = ({ checked, onChange, name, accent = T.amber }) => (
  <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}>
    <input type="checkbox" name={name} checked={checked} onChange={onChange} style={{ display: 'none' }} />
    <div style={{
      width: 44, height: 24, borderRadius: 99,
      background: checked ? accent : T.surfaceHi,
      border: `1px solid ${checked ? accent : T.border}`,
      transition: 'all 0.22s', position: 'relative',
      boxShadow: checked ? `0 0 12px ${accent}55` : 'none'
    }}>
      <div style={{
        position: 'absolute', top: 3, left: checked ? 22 : 3,
        width: 16, height: 16, borderRadius: '50%',
        background: checked ? '#fff' : T.textMuted,
        transition: 'left 0.22s, background 0.22s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.4)'
      }} />
    </div>
  </label>
);

const SettingRow = ({ icon, title, desc, children, accent }) => (
  <motion.div
    variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
    style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 0', borderBottom: `1px solid ${T.border}`, gap: 16
    }}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11, minWidth: 0 }}>
      {icon && (
        <div style={{
          width: 30, height: 30, borderRadius: 8, flexShrink: 0, marginTop: 1,
          background: `${accent || T.amber}15`,
          border: `1px solid ${accent || T.amber}25`,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <i className={icon} style={{ fontSize: 13, color: accent || T.amber }}></i>
        </div>
      )}
      <div>
        <p style={{ fontSize: '0.83rem', fontWeight: 600, color: T.text, margin: 0 }}>{title}</p>
        <p style={{ fontSize: '0.72rem', color: T.textMuted, margin: '2px 0 0', lineHeight: 1.5 }}>{desc}</p>
      </div>
    </div>
    <div style={{ flexShrink: 0 }}>{children}</div>
  </motion.div>
);

/* Inline status pill */
const StatusPill = ({ type, message }) => {
  if (!message) return null;
  const cfg = {
    success: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', color: '#34d399', icon: 'ri-check-double-line' },
    error:   { bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.25)',  color: '#f87171', icon: 'ri-error-warning-line' },
  }[type] || {};
  return (
    <motion.div
      initial={{ opacity: 0, x: -8, scale: 0.97 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: -8 }}
      style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 12px', borderRadius: 8,
        background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color,
        fontSize: '0.76rem', fontWeight: 500, fontFamily: "'Syne', sans-serif"
      }}
    >
      <i className={cfg.icon}></i>{message}
    </motion.div>
  );
};

/* ─────────────────────────────────────────────
   PROFILE TAB
───────────────────────────────────────────── */
const ProfileTab = ({ formData, handleChange }) => (
  <motion.div variants={{ show: { transition: { staggerChildren: 0.06 } } }} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

    {/* Avatar row */}
    <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
      style={{
        display: 'flex', alignItems: 'center', gap: 16, padding: '16px',
        background: T.surfaceHi, borderRadius: 12, border: `1px solid ${T.border}`
      }}
    >
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <img
          src={formData.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.displayName || formData.email)}&background=f59e0b&color=000&size=80&bold=true`}
          alt="Avatar"
          style={{ width: 60, height: 60, borderRadius: 14, objectFit: 'cover', border: `2px solid ${T.amberBorder}`, display: 'block' }}
        />
        <div style={{
          position: 'absolute', bottom: -4, right: -4,
          width: 20, height: 20, borderRadius: '50%',
          background: T.amber, border: `2px solid ${T.surface}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
        }}>
          <i className="ri-camera-line" style={{ fontSize: 9, color: '#000' }}></i>
        </div>
      </div>
      <div>
        <p style={{ fontSize: '0.9rem', fontWeight: 700, color: T.text, margin: '0 0 3px' }}>
          {formData.displayName || 'No name set'}
        </p>
        <p style={{ fontSize: '0.72rem', color: T.textMuted, margin: '0 0 7px' }}>{formData.email}</p>
        <span style={{
          fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
          padding: '2px 8px', borderRadius: 5, background: T.amberDim,
          border: `1px solid ${T.amberBorder}`, color: T.amber,
          fontFamily: "'Geist Mono', monospace"
        }}>Developer</span>
      </div>
    </motion.div>

    {/* Fields */}
    <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
      style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}
    >
      <StudioInput label="Display Name" type="text" name="displayName" value={formData.displayName} onChange={handleChange} placeholder="Your name" />
      <StudioInput label="Email Address" type="email" name="email" value={formData.email} disabled
        style={{ opacity: 0.45, cursor: 'not-allowed' }}
      />
    </motion.div>

    <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
      <StudioTextarea
        label="Bio" name="bio" rows={3} value={formData.bio} onChange={handleChange}
        placeholder="Write a short bio about yourself..."
        maxLen={250}
      />
    </motion.div>

    <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
      <StudioInput label="Photo URL" type="url" name="photoURL" value={formData.photoURL} onChange={handleChange} placeholder="https://example.com/avatar.jpg" />
    </motion.div>
  </motion.div>
);

/* ─────────────────────────────────────────────
   PREFERENCES TAB
───────────────────────────────────────────── */
const PreferencesTab = ({ settings, handleChange }) => (
  <motion.div variants={{ show: { transition: { staggerChildren: 0.07 } } }} initial="hidden" animate="show">
    <SettingRow icon="ri-sun-line" accent="#10b981" title="Interface Theme" desc="Choose your preferred visual style across the app.">
      <StudioSelect
        name="settings.theme" value={settings.theme} onChange={handleChange}
        options={[{ value: 'light', label: '☀️ Light' }, { value: 'dark', label: '🌙 Dark' }, { value: 'auto', label: '💻 System' }]}
      />
    </SettingRow>
    <SettingRow icon="ri-text-size" accent="#10b981" title="Editor Font Size" desc="Controls the font size within the code editor.">
      <StudioSelect
        name="settings.fontSize" value={settings.fontSize} onChange={handleChange}
        options={[12, 13, 14, 15, 16, 18].map(s => ({ value: s, label: `${s}px` }))}
      />
    </SettingRow>
    <SettingRow icon="ri-save-3-line" accent="#10b981" title="Auto-Save" desc="Automatically save file changes as you type.">
      <Toggle name="settings.autoSave" checked={settings.autoSave} onChange={handleChange} accent="#10b981" />
    </SettingRow>
    <SettingRow icon="ri-layout-grid-line" accent="#10b981" title="Compact View" desc="Reduce padding for a denser interface layout.">
      <Toggle name="settings.compactView" checked={settings.compactView || false} onChange={handleChange} accent="#10b981" />
    </SettingRow>
  </motion.div>
);

/* ─────────────────────────────────────────────
   AI TAB
───────────────────────────────────────────── */
const AITab = ({ settings, handleChange }) => (
  <motion.div variants={{ show: { transition: { staggerChildren: 0.07 } } }} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
    <SettingRow icon="ri-robot-2-line" accent="#6366f1" title="Enable AI Assistance" desc="Unlock AI-powered completions, suggestions, and chat.">
      <Toggle name="settings.aiAssistance" checked={settings.aiAssistance} onChange={handleChange} accent="#6366f1" />
    </SettingRow>
    <SettingRow icon="ri-sparkling-2-line" accent="#6366f1" title="Inline Suggestions" desc="Show ghost-text completions inside the editor.">
      <Toggle name="settings.inlineSuggestions" checked={settings.inlineSuggestions || true} onChange={handleChange} accent="#6366f1" />
    </SettingRow>
    <SettingRow icon="ri-feedback-line" accent="#6366f1" title="Error Explanations" desc="AI explains errors and suggests fixes automatically.">
      <Toggle name="settings.errorExplain" checked={settings.errorExplain || true} onChange={handleChange} accent="#6366f1" />
    </SettingRow>

    {/* Feature grid */}
    <motion.div
      variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
      style={{
        marginTop: 20, padding: '16px', borderRadius: 12,
        background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)'
      }}
    >
      <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#818cf8', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 12px', fontFamily: "'Geist Mono', monospace" }}>
        Included AI Capabilities
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 8 }}>
        {[
          { icon: 'ri-code-s-slash-line', label: 'Code completion' },
          { icon: 'ri-bug-line',          label: 'Error detection' },
          { icon: 'ri-speed-up-line',     label: 'Code optimization' },
          { icon: 'ri-translate-2',       label: 'Natural language' },
          { icon: 'ri-git-branch-line',   label: 'Refactoring hints' },
          { icon: 'ri-shield-check-line', label: 'Security scan' },
        ].map((f, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
            background: T.surface, borderRadius: 8, border: `1px solid ${T.border}`
          }}>
            <i className={f.icon} style={{ fontSize: 13, color: '#818cf8', flexShrink: 0 }}></i>
            <span style={{ fontSize: '0.76rem', color: T.textMuted }}>{f.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  </motion.div>
);

/* ─────────────────────────────────────────────
   SECURITY TAB
───────────────────────────────────────────── */
const SecurityTab = () => {
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  const handleChange = e => setPasswords(p => ({ ...p, [e.target.name]: e.target.value }));

  const strength = (pw) => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 6) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };
  const s = strength(passwords.newPassword);
  const strengthMeta = [
    null,
    { label: 'Weak',   color: '#ef4444' },
    { label: 'Fair',   color: '#f59e0b' },
    { label: 'Good',   color: '#3b82f6' },
    { label: 'Strong', color: '#10b981' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) { setStatus({ type: 'error', message: "Passwords don't match." }); return; }
    if (passwords.newPassword.length < 3) { setStatus({ type: 'error', message: 'Min 3 characters required.' }); return; }
    setStatus({ type: 'saving', message: '' });
    try {
      const res = await api.put('/users/password', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      setStatus({ type: 'success', message: res.data.message || 'Password updated!' });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || err.response?.data || 'Failed to update.' });
    } finally {
      setTimeout(() => setStatus({ type: 'idle', message: '' }), 4000);
    }
  };

  const PwInput = ({ label, name, keyName }) => (
    <div style={{ position: 'relative' }}>
      <StudioInput
        label={label}
        type={showPw[keyName] ? 'text' : 'password'}
        name={name}
        value={passwords[name]}
        onChange={handleChange}
        placeholder="••••••••"
        required
      />
      <button
        type="button"
        onClick={() => setShowPw(p => ({ ...p, [keyName]: !p[keyName] }))}
        style={{
          position: 'absolute', right: 11, top: 33,
          background: 'none', border: 'none', cursor: 'pointer',
          color: T.textMuted, padding: 2, lineHeight: 1
        }}
      >
        <i className={showPw[keyName] ? 'ri-eye-off-line' : 'ri-eye-line'} style={{ fontSize: 15 }}></i>
      </button>
    </div>
  );

  return (
    <motion.div variants={{ show: { transition: { staggerChildren: 0.07 } } }} initial="hidden" animate="show"
      style={{ display: 'flex', flexDirection: 'column', gap: 22 }}
    >
      <motion.form
        variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 380 }}
      >
        <PwInput label="Current Password" name="currentPassword" keyName="current" />

        <div>
          <PwInput label="New Password" name="newPassword" keyName="new" />
          <AnimatePresence>
            {passwords.newPassword && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{
                      flex: 1, height: 3, borderRadius: 99, transition: 'background 0.25s',
                      background: i <= s ? (strengthMeta[s]?.color || T.textDim) : T.surfaceHi
                    }} />
                  ))}
                </div>
                <p style={{ fontSize: '0.68rem', color: strengthMeta[s]?.color || T.textMuted, fontFamily: "'Geist Mono', monospace" }}>
                  {strengthMeta[s]?.label}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <PwInput label="Confirm New Password" name="confirmPassword" keyName="confirm" />

        <AnimatePresence>
          {(status.type === 'success' || status.type === 'error') && (
            <StatusPill type={status.type} message={status.message} />
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={status.type === 'saving'}
          style={{
            padding: '10px 20px', borderRadius: 9, border: 'none', cursor: 'pointer',
            background: status.type === 'saving' ? T.surfaceHi : `linear-gradient(135deg, #dc2626, #b91c1c)`,
            color: '#fff', fontSize: '0.82rem', fontWeight: 700,
            fontFamily: "'Syne', sans-serif", transition: 'all 0.18s',
            opacity: status.type === 'saving' ? 0.6 : 1,
            boxShadow: status.type === 'saving' ? 'none' : '0 4px 18px rgba(239,68,68,0.3)'
          }}
        >
          {status.type === 'saving'
            ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <i className="ri-loader-4-line" style={{ animation: 'spin 1s linear infinite' }}></i> Updating…
              </span>
            : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                <i className="ri-lock-password-line" style={{ fontSize: 14 }}></i> Update Password
              </span>
          }
        </button>
      </motion.form>

      {/* 2FA card */}
      <motion.div
        variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
        style={{
          padding: '14px 16px', borderRadius: 12,
          background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <i className="ri-shield-flash-line" style={{ fontSize: 15, color: '#ef4444' }}></i>
          </div>
          <div>
            <p style={{ fontSize: '0.83rem', fontWeight: 600, color: T.text, margin: 0 }}>Two-Factor Authentication</p>
            <p style={{ fontSize: '0.7rem', color: T.textMuted, margin: '2px 0 0' }}>Add an extra layer of security</p>
          </div>
        </div>
        <span style={{
          fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
          padding: '4px 9px', borderRadius: 6, background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444',
          fontFamily: "'Geist Mono', monospace", whiteSpace: 'nowrap'
        }}>
          Coming Soon
        </span>
      </motion.div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────
   MAIN SETTINGS PAGE
───────────────────────────────────────────── */
const Settings = () => {
  const { user, setUser, updateUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState(null);
  const [status, setStatus] = useState({ type: 'idle', message: '' });

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/login'); return; }
    api.get('/users/profile')
      .then(res => {
        const u = res.data.user;
        setUser(u);
        setFormData({
          displayName: u.displayName || '', email: u.email || '',
          bio: u.bio || '', photoURL: u.photoURL || '',
          settings: { ...defaultSettings, ...(u.settings || {}) },
        });
      })
      .catch(() => navigate('/login'));
  }, [navigate, setUser]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const [section, key] = name.split('.');
    setFormData(prev => {
      if (section && key) {
        return { ...prev, [section]: { ...prev[section], [key]: type === 'checkbox' ? checked : (key === 'fontSize' ? Number(value) : value) } };
      }
      return { ...prev, [name]: type === 'checkbox' ? checked : value };
    });
  };

  const handleSave = async () => {
    setStatus({ type: 'saving', message: '' });
    try {
      const payload = { displayName: formData.displayName, bio: formData.bio || '', photoURL: formData.photoURL || '', settings: formData.settings };
      const res = await api.put('/users/profile', payload);
      const u = res.data.user;
      updateUser(u);
      setFormData({ displayName: u.displayName || '', email: u.email || '', bio: u.bio || '', photoURL: u.photoURL || '', settings: { ...defaultSettings, ...(u.settings || {}) } });
      setStatus({ type: 'success', message: 'Changes saved' });
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to save.';
      setStatus({ type: 'error', message: String(msg) });
    } finally {
      setTimeout(() => setStatus({ type: 'idle', message: '' }), 4000);
    }
  };

  const handleCancel = () => {
    if (user) setFormData({
      displayName: user.displayName || '', email: user.email || '',
      bio: user.bio || '', photoURL: user.photoURL || '',
      settings: { ...defaultSettings, ...(user.settings || {}) },
    });
  };

  /* Loading */
  if (!user || !formData) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: T.bg }}>
      <Header />
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '32px 40px', borderRadius: 16, background: T.surface, border: `1px solid ${T.border}` }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: T.amberDim, border: `1px solid ${T.amberBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ri-loader-4-line" style={{ fontSize: 20, color: T.amber, animation: 'spin 1s linear infinite' }}></i>
          </div>
          <p style={{ color: T.textMuted, fontSize: '0.82rem', fontFamily: "'Syne', sans-serif", margin: 0 }}>Loading settings…</p>
        </motion.div>
      </main>
      <Footer />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const activeTabData = TABS.find(t => t.id === activeTab);
  const tabDescriptions = {
    profile:     'Manage your personal details and public profile',
    preferences: 'Customize appearance and editor behavior',
    ai:          'Configure AI assistance and intelligent features',
    security:    'Update credentials and account protection',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: T.bg, fontFamily: "'Syne', sans-serif" }}>

      {/* Subtle background grid */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px'
      }} />
      {/* Amber glow top-left */}
      <div style={{
        position: 'fixed', top: -120, left: -80, width: 400, height: 400,
        borderRadius: '50%', background: 'rgba(245,158,11,0.06)',
        filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0
      }} />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />

        <main style={{ flex: 1, maxWidth: 920, width: '100%', margin: '0 auto', padding: '32px 20px 48px' }}>

          {/* ── Page header ── */}
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
            style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: T.amberDim, border: `1px solid ${T.amberBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 20px rgba(245,158,11,0.15)`
              }}>
                <i className="ri-settings-4-line" style={{ fontSize: 16, color: T.amber }}></i>
              </div>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: T.text, margin: 0, letterSpacing: '-0.02em' }}>
                Settings
              </h1>
            </div>
            <p style={{ fontSize: '0.8rem', color: T.textMuted, margin: 0, paddingLeft: 46 }}>
              {tabDescriptions[activeTab]}
            </p>
          </motion.div>

          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>

            {/* ── Sidebar ── */}
            <motion.aside
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay: 0.08 }}
              style={{ width: 200, flexShrink: 0, minWidth: 160 }}
            >
              {/* Nav */}
              <div style={{ background: T.surface, borderRadius: 14, border: `1px solid ${T.border}`, padding: 6, marginBottom: 12 }}>
                {TABS.map((tab, i) => {
                  const active = activeTab === tab.id;
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 9,
                        padding: '9px 11px', borderRadius: 9, cursor: 'pointer',
                        border: 'none', textAlign: 'left', transition: 'all 0.14s',
                        background: active ? `${tab.color}18` : 'transparent',
                        boxShadow: active ? `inset 0 0 0 1px ${tab.color}30` : 'none',
                        marginBottom: i < TABS.length - 1 ? 2 : 0,
                        fontFamily: "'Syne', sans-serif",
                      }}
                    >
                      <div style={{
                        width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                        background: active ? `${tab.color}20` : T.surfaceHi,
                        border: `1px solid ${active ? `${tab.color}40` : T.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.14s'
                      }}>
                        <i className={tab.icon} style={{ fontSize: 13, color: active ? tab.color : T.textMuted }}></i>
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: active ? 700 : 500, color: active ? T.text : T.textMuted, transition: 'color 0.14s' }}>
                        {tab.label}
                      </span>
                      {active && (
                        <motion.div
                          layoutId="activeIndicator"
                          style={{ marginLeft: 'auto', width: 4, height: 4, borderRadius: '50%', background: tab.color, flexShrink: 0, boxShadow: `0 0 8px ${tab.color}` }}
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* User mini-card */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
                style={{ background: T.surface, borderRadius: 12, border: `1px solid ${T.border}`, padding: '11px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <img
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=f59e0b&color=000&size=40&bold=true`}
                  alt="" style={{ width: 32, height: 32, borderRadius: 9, objectFit: 'cover', border: `1.5px solid ${T.amberBorder}`, flexShrink: 0 }}
                />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '0.76rem', fontWeight: 700, color: T.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.displayName || 'User'}
                  </p>
                  <p style={{ fontSize: '0.63rem', color: T.textMuted, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.email}
                  </p>
                </div>
              </motion.div>
            </motion.aside>

            {/* ── Main Panel ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.12 }}
              style={{ flex: 1, minWidth: 0 }}
            >
              <div style={{ background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`, overflow: 'hidden' }}>

                {/* Panel header */}
                <div style={{
                  padding: '14px 20px',
                  borderBottom: `1px solid ${T.border}`,
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: `${activeTabData.color}08`
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                    background: `${activeTabData.color}18`,
                    border: `1px solid ${activeTabData.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <i className={activeTabData.icon} style={{ fontSize: 14, color: activeTabData.color }}></i>
                  </div>
                  <div>
                    <h2 style={{ fontSize: '0.88rem', fontWeight: 700, color: T.text, margin: 0 }}>{activeTabData.label}</h2>
                    <p style={{ fontSize: '0.68rem', color: T.textMuted, margin: 0, fontFamily: "'Geist Mono', monospace" }}>
                      {tabDescriptions[activeTab]}
                    </p>
                  </div>

                  {/* Tab breadcrumb pill */}
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                    {TABS.map(t => (
                      <button key={t.id} onClick={() => setActiveTab(t.id)}
                        title={t.label}
                        style={{
                          width: 7, height: 7, borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.15s',
                          background: activeTab === t.id ? t.color : T.surfaceHi,
                          boxShadow: activeTab === t.id ? `0 0 6px ${t.color}` : 'none'
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: '22px 22px 6px' }}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      {activeTab === 'profile'     && <ProfileTab formData={formData} handleChange={handleChange} />}
                      {activeTab === 'preferences' && <PreferencesTab settings={formData.settings} handleChange={handleChange} />}
                      {activeTab === 'ai'          && <AITab settings={formData.settings} handleChange={handleChange} />}
                      {activeTab === 'security'    && <SecurityTab />}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Footer actions */}
                {activeTab !== 'security' && (
                  <div style={{
                    padding: '14px 22px',
                    borderTop: `1px solid ${T.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                    marginTop: 16
                  }}>
                    <AnimatePresence>
                      {status.message
                        ? <StatusPill type={status.type} message={status.message} />
                        : <div />
                      }
                    </AnimatePresence>

                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <button
                        onClick={handleCancel}
                        disabled={status.type === 'saving'}
                        style={{
                          padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
                          background: 'transparent', color: T.textMuted,
                          border: `1px solid ${T.border}`, fontSize: '0.78rem', fontWeight: 600,
                          fontFamily: "'Syne', sans-serif", transition: 'all 0.14s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderHi; e.currentTarget.style.color = T.text; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMuted; }}
                      >
                        Discard
                      </button>

                      <motion.button
                        onClick={handleSave}
                        disabled={status.type === 'saving'}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        style={{
                          padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
                          background: status.type === 'saving'
                            ? T.surfaceHi
                            : `linear-gradient(135deg, ${T.amber}, #d97706)`,
                          color: status.type === 'saving' ? T.textMuted : '#000',
                          fontSize: '0.78rem', fontWeight: 700, minWidth: 120,
                          fontFamily: "'Syne', sans-serif", transition: 'all 0.18s',
                          boxShadow: status.type === 'saving' ? 'none' : `0 4px 18px rgba(245,158,11,0.3)`,
                          opacity: status.type === 'saving' ? 0.55 : 1
                        }}
                      >
                        {status.type === 'saving'
                          ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                              <i className="ri-loader-4-line" style={{ animation: 'spin 1s linear infinite' }}></i> Saving…
                            </span>
                          : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                              <i className="ri-save-3-line" style={{ fontSize: 13 }}></i> Save Changes
                            </span>
                        }
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.14); }
        ::placeholder { color: #3a3a48 !important; opacity: 1; }
        option { background: #131318; color: #f0f0f4; }

        @media (max-width: 640px) {
          aside { width: 100% !important; min-width: unset !important; }
          aside > div:first-child nav { display: flex !important; flex-direction: row !important; overflow-x: auto; gap: 4px; }
          aside > div:first-child nav button { flex-direction: column !important; gap: 4px !important; padding: 8px 10px !important; min-width: 70px; }
        }
      `}</style>
    </div>
  );
};

export default Settings;