import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../config/axios';
import { UserContext } from '../context/user.context';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Font injection ─── */
const injectFonts = () => {
  if (document.getElementById('login-fonts')) return;
  const link = document.createElement('link');
  link.id = 'login-fonts';
  link.rel = 'stylesheet';
  link.href =
    'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Outfit:wght@300;400;500;600&display=swap';
  document.head.appendChild(link);
};

/* ─── SVG dot grid background ─── */
const DotGrid = () => (
  <svg
    className="absolute inset-0 w-full h-full opacity-[0.15]"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
        <circle cx="1.5" cy="1.5" r="1.5" fill="white" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#dots)" />
  </svg>
);

/* ─── Input Field with animated label ─── */
function InputField({ label, type: initialType, value, onChange, autoComplete, icon, error, name }) {
  const [focused, setFocused] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const type = initialType === 'password' ? (showPwd ? 'text' : 'password') : initialType;
  const isPassword = initialType === 'password';
  const hasValue = value.length > 0;
  const active = focused || hasValue;

  return (
    <div className="relative">
      <div
        className={`relative flex items-center rounded-xl border transition-all duration-200 bg-white overflow-hidden
          ${error ? 'border-red-400 ring-1 ring-red-300' : focused ? 'border-violet-500 ring-1 ring-violet-200' : 'border-gray-200'}`}
      >
        {/* Icon */}
        <div className={`pl-4 pr-0 flex-shrink-0 transition-colors duration-200 ${focused ? 'text-violet-500' : 'text-gray-350'}`}
          style={{ color: focused ? '#7c3aed' : '#9ca3af' }}>
          {icon}
        </div>

        {/* Input */}
        <div className="relative flex-1 h-14">
          <label
            className="absolute left-3 transition-all duration-200 pointer-events-none origin-left font-medium"
            style={{
              fontFamily: 'Outfit, sans-serif',
              top: active ? '6px' : '50%',
              transform: active ? 'translateY(0) scale(0.72)' : 'translateY(-50%) scale(1)',
              color: error ? '#f87171' : focused ? '#7c3aed' : '#9ca3af',
              fontSize: '15px',
            }}
          >
            {label}
          </label>
          <input
            type={type}
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoComplete={autoComplete}
            name={name}
            className="absolute inset-0 w-full h-full bg-transparent outline-none pt-5 pb-1 px-3 text-sm text-gray-900"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          />
        </div>

        {/* Show/hide password */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPwd(s => !s)}
            className="pr-4 pl-1 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            tabIndex={-1}
          >
            {showPwd ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Field error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-red-500 mt-1.5 ml-1 flex items-center gap-1"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── OAuth Button ─── */
function OAuthButton({ onClick, disabled, children, logo }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={{ y: -1, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
      whileTap={{ scale: 0.98 }}
      className="flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
      style={{ fontFamily: 'Outfit, sans-serif' }}
    >
      {logo}
      {children}
    </motion.button>
  );
}

/* ─── Main Login Component ─── */
export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => { injectFonts(); }, []);

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email address.';
    if (!password) errs.password = 'Password is required.';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters.';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setLoading(true);
    axios.post('/users/login', { email, password })
      .then(res => {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        navigate('/');
      })
      .catch(err => {
        setError(err.response?.data?.error || err.response?.data || 'Login failed. Please try again.');
      })
      .finally(() => setLoading(false));
  };

  const handleGoogleLogin = () => window.location.href = `${import.meta.env.VITE_API_URL}/auth/google/test`;
  const handleGithubLogin = () => window.location.href = `${import.meta.env.VITE_API_URL}/auth/github`;

  const features = [
    { emoji: '⚡', text: 'AI-powered code generation' },
    { emoji: '🤝', text: 'Real-time team collaboration' },
    { emoji: '⬡', text: 'Integrated terminal & editor' },
    { emoji: '🔒', text: 'Secure & encrypted workspaces' },
  ];

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        .login-root { font-family: 'Outfit', sans-serif; }
        .playfair { font-family: 'Playfair Display', serif; }
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, -40px) scale(1.08); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, 30px) scale(1.05); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .orb1 { animation: float1 9s ease-in-out infinite; }
        .orb2 { animation: float2 12s ease-in-out infinite; }
        .btn-shimmer {
          background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 40%, #7c3aed 80%, #4f46e5 100%);
          background-size: 200% auto;
        }
        .btn-shimmer:hover {
          animation: shimmer 1.8s linear infinite;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        .shake { animation: shake 0.4s ease; }
      `}</style>

      <div className="login-root min-h-screen flex" style={{ background: '#f9f9fb' }}>

        {/* ── LEFT PANEL (desktop only) ── */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden"
          style={{ background: '#0D0D16' }}
        >
          <DotGrid />

          {/* Gradient orbs */}
          <div className="orb1 absolute top-[-80px] left-[-60px] w-[420px] h-[420px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.35) 0%, transparent 70%)' }} />
          <div className="orb2 absolute bottom-[-100px] right-[-80px] w-[500px] h-[500px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.3) 0%, transparent 70%)' }} />

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v2M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2h-2" />
              </svg>
            </div>
            <span className="text-white font-semibold text-base tracking-tight">Innovative AI</span>
          </motion.div>

          {/* Center copy */}
          <div className="relative flex-1 flex flex-col justify-center py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
            >
              <p className="text-violet-400 text-xs font-semibold uppercase tracking-[0.2em] mb-4">Developer Platform</p>
              <h1 className="playfair text-5xl font-bold text-white leading-[1.15] mb-6">
                Build faster<br />with <span style={{ color: '#a78bfa' }}>AI</span> by<br />your side.
              </h1>
              <p className="text-white/45 text-sm leading-relaxed max-w-xs">
                A collaborative workspace where teams ship production-ready software with AI assistance.
              </p>
            </motion.div>

            {/* Feature list */}
            <div className="mt-10 space-y-3">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
                    style={{ background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.3)' }}>
                    {f.emoji}
                  </div>
                  <span className="text-white/60 text-sm">{f.text}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom trust bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="relative flex items-center gap-3"
          >
            <div className="flex -space-x-2">
              {['#7c3aed', '#4f46e5', '#0891b2', '#059669', '#d97706'].map((c, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-white text-[11px] font-bold"
                  style={{ background: c, borderColor: '#0D0D16' }}>
                  {['A', 'B', 'C', 'D', 'E'][i]}
                </div>
              ))}
            </div>
            <div>
              <p className="text-white/70 text-xs font-medium">Trusted by 2,400+ developers</p>
              <div className="flex gap-0.5 mt-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* ── RIGHT PANEL (form) ── */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 px-6 pt-6">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v2M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2h-2" />
              </svg>
            </div>
            <span className="font-semibold text-gray-800 text-base">Innovative AI</span>
          </div>

          {/* Form area */}
          <div className="flex-1 flex items-center justify-center px-6 py-12">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
              className="w-full max-w-[400px]"
            >
              {/* Heading */}
              <div className="mb-8">
                <h2 className="playfair text-3xl font-bold text-gray-900 mb-2">Sign in</h2>
                <p className="text-gray-500 text-sm">Welcome back — enter your credentials below.</p>
              </div>

              {/* OAuth buttons */}
              <div className="flex gap-3 mb-6">
                <OAuthButton onClick={handleGoogleLogin} disabled={loading} logo={
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                }>Google</OAuthButton>

                <OAuthButton onClick={handleGithubLogin} disabled={loading} logo={
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                }>GitHub</OAuthButton>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">or with email</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Global error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    className="shake mb-5 flex items-start gap-3 px-4 py-3 rounded-xl border text-sm"
                    style={{
                      background: 'rgba(239,68,68,0.06)',
                      borderColor: 'rgba(239,68,68,0.25)',
                      color: '#ef4444',
                      fontFamily: 'Outfit, sans-serif',
                    }}
                  >
                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <InputField
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: '' })); }}
                  autoComplete="email"
                  name="email"
                  error={fieldErrors.email}
                  icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  }
                />

                <InputField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: '' })); }}
                  autoComplete="current-password"
                  name="password"
                  error={fieldErrors.password}
                  icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  }
                />

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.99 }}
                  className="btn-shimmer w-full py-3.5 rounded-xl text-white text-sm font-semibold mt-2 relative overflow-hidden disabled:opacity-60 transition-opacity"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  {/* Loading bar */}
                  <AnimatePresence>
                    {loading && (
                      <motion.div
                        initial={{ scaleX: 0, originX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 2, ease: 'easeInOut' }}
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/50"
                      />
                    )}
                  </AnimatePresence>

                  {loading ? (
                    <span className="flex items-center justify-center gap-2.5">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Signing in…
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Sign in
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  )}
                </motion.button>
              </form>

              {/* Footer links */}
              <p className="text-center text-sm text-gray-500 mt-6">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-semibold hover:underline"
                  style={{ color: '#7c3aed' }}
                >
                  Create one free
                </Link>
              </p>
            </motion.div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 text-center">
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} Innovative AI · 
              <span className="ml-1 hover:text-gray-600 cursor-pointer transition-colors">Privacy</span> · 
              <span className="ml-1 hover:text-gray-600 cursor-pointer transition-colors">Terms</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}