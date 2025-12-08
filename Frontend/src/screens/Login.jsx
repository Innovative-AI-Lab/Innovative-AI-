import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../config/axios";
import { UserContext } from "../context/user.context";

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const {setUser} = useContext(UserContext)

    const validate = () => {
        const e = {};
        if (!email) e.email = "Email is required.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email.";
        if (!password) e.password = "Password is required.";
        else if (password.length < 6) e.password = "Password must be at least 6 characters.";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        setLoading(true);
        
        axios.post("/users/login", { 
            email, 
            password 
        }).then((res) => {
            console.log(res.data)
            localStorage.setItem('token', res.data.token)
            setUser(res.data.user)
            navigate("/")
        }).catch((err) => {
            console.log(err.response.data)
        }).finally(() => {
            setLoading(false);
        });
    };

    const handleGoogleLogin = () => {
        // Test with a simple redirect first
        window.location.href = 'http://localhost:4001/auth/google/test';
    };

    const handleGithubLogin = () => {
        // GitHub OAuth will be handled by backend
        window.location.href = `${import.meta.env.VITE_API_URL}/auth/github`;
    };

    return (
        <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-purple-100/30 to-pink-100/50"></div>
            <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>
            
            <div className="relative h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-4xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch h-full max-h-[90vh]">
                        {/* Branding Section */}
                        <div className="hidden lg:flex flex-col justify-center bg-white/20 backdrop-blur-2xl rounded-3xl p-12 border border-white/30 shadow-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10"></div>
                            <div className="relative">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl ring-2 ring-white/30">
                                        <i className="ri-brain-fill text-white text-2xl"></i>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Innovative AI</h3>
                                        <p className="text-gray-600 font-medium">Full Stack Development Platform</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <p className="text-lg text-gray-700 leading-relaxed">Build amazing projects with AI-powered assistance, real-time collaboration, and integrated development tools.</p>
                                    
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                                                <i className="ri-robot-2-fill text-white"></i>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800">AI Assistant</h4>
                                                <p className="text-sm text-gray-600">Intelligent code generation</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                                                <i className="ri-message-3-fill text-white"></i>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800">Real-time Chat</h4>
                                                <p className="text-sm text-gray-600">Team collaboration</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                                                <i className="ri-code-s-slash-fill text-white"></i>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800">Code Editor</h4>
                                                <p className="text-sm text-gray-600">Built-in development tools</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Card */}
                        <div className="bg-white/30 backdrop-blur-2xl rounded-3xl p-6 lg:p-8 border border-white/30 shadow-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5"></div>
                            
                            <div className="relative mb-6 text-center">
                                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">Welcome Back</h1>
                                <p className="text-gray-600 font-medium">Sign in to continue to your workspace</p>
                            </div>

                            <div className="relative space-y-4">
                                <div className="flex gap-3">
                                    <button type="button" onClick={handleGoogleLogin} disabled={loading} className="flex-1 group flex items-center justify-center gap-3 py-3 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 text-gray-700 hover:bg-white/30 transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50">
                                        {loading ? <i className="ri-loader-4-line animate-spin text-lg"></i> : <i className="ri-google-fill text-lg group-hover:scale-110 transition-transform duration-300"></i>}
                                        <span>Google</span>
                                    </button>
                                    <button type="button" onClick={handleGithubLogin} disabled={loading} className="flex-1 group flex items-center justify-center gap-3 py-3 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 text-gray-700 hover:bg-white/30 transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50">
                                        {loading ? <i className="ri-loader-4-line animate-spin text-lg"></i> : <i className="ri-github-fill text-lg group-hover:scale-110 transition-transform duration-300"></i>}
                                        <span>GitHub</span>
                                    </button>
                                </div>

                                <div className="relative flex items-center">
                                    <span className="flex-grow border-t border-gray-300" />
                                    <span className="px-4 text-sm text-gray-500 bg-white/50 rounded-full font-medium">or continue with email</span>
                                    <span className="flex-grow border-t border-gray-300" />
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500">
                                                <i className="ri-mail-line text-lg"></i>
                                            </div>
                                            <input
                                                id="email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className={`w-full pl-12 pr-4 py-4 rounded-2xl bg-white/30 backdrop-blur-xl border ${errors.email ? "border-red-400" : "border-white/40"} text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 shadow-lg font-medium`}
                                                placeholder="you@company.com"
                                                autoComplete="email"
                                            />
                                        </div>
                                        {errors.email && <p className="mt-2 text-sm text-red-600 font-medium">{errors.email}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500">
                                                <i className="ri-lock-line text-lg"></i>
                                            </div>
                                            <input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className={`w-full pl-12 pr-16 py-4 rounded-2xl bg-white/30 backdrop-blur-xl border ${errors.password ? "border-red-400" : "border-white/40"} text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 shadow-lg font-medium`}
                                                placeholder="Enter your password"
                                                autoComplete="current-password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword((s) => !s)}
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                                            >
                                                <i className={`ri-${showPassword ? 'eye-off' : 'eye'}-line text-lg`}></i>
                                            </button>
                                        </div>
                                        {errors.password && <p className="mt-2 text-sm text-red-600 font-medium">{errors.password}</p>}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center gap-3">
                                            <input type="checkbox" className="w-4 h-4 rounded bg-white/30 border-white/40 text-blue-600 focus:ring-blue-500" />
                                            <span className="text-sm font-medium text-gray-700">Remember me</span>
                                        </label>
                                        <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">Forgot password?</Link>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-2xl hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-300 font-bold shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none"
                                    >
                                        {loading ? (
                                            <div className="flex items-center justify-center gap-3">
                                                <i className="ri-loader-4-line animate-spin text-xl"></i>
                                                <span>Signing in...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center gap-3">
                                                <i className="ri-login-circle-line text-xl"></i>
                                                <span>Sign In</span>
                                            </div>
                                        )}
                                    </button>
                                </form>

                                <div className="text-center">
                                    <p className="text-gray-600 font-medium">
                                        Don't have an account?{" "}
                                        <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">Create one</Link>
                                    </p>
                                </div>

                                <div className="text-center text-sm text-gray-500">
                                    By continuing, you agree to our <Link to="/terms" className="font-medium text-blue-600 hover:underline">Terms</Link> and <Link to="/privacy" className="font-medium text-blue-600 hover:underline">Privacy Policy</Link>.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}