import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Eye, EyeOff, BookOpen } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await api.post('/auth/login', { email, password });
            login(response.data, response.data.token);
            if (response.data.role === 'TUTOR') {
                navigate('/tutor/dashboard');
            } else {
                navigate('/discover');
            }
        } catch (err) {
            setError('Invalid email or password. Please verify your credentials.');
        }
    };

    return (
        <div className="w-full min-h-screen flex flex-col md:flex-row bg-white">
            {/* Left side - Soft Blue with Illustration */}
            <div className="w-full md:w-1/2 bg-[#E0F7FA] p-8 md:p-16 flex flex-col justify-between">
                <div>
                    <Link to="/" className="text-secondary hover:text-secondary-hover transition-colors text-sm font-semibold flex items-center gap-2">
                        <span>←</span> Back to Home
                    </Link>
                </div>
                
                <div className="my-16 md:my-0 flex flex-col items-center justify-center text-center">
                    <div className="w-64 h-64 bg-white/50 rounded-full flex items-center justify-center mb-10 shadow-sm border border-white/60">
                        <BookOpen size={80} className="text-secondary" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-800 leading-tight mb-4 tracking-tight">
                        Welcome Back!
                    </h1>
                    <p className="text-slate-600 text-lg max-w-sm">
                        Sign in to continue your learning journey and access your courses.
                    </p>
                </div>

                <div className="text-slate-500 text-sm font-medium">
                    PeerTutor Network &copy; {new Date().getFullYear()}
                </div>
            </div>

            {/* Right side - Clean White Form */}
            <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white">
                <div className="max-w-md w-full mx-auto">
                    <div className="mb-10 text-center md:text-left">
                        <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Log in to your account</h2>
                        <p className="text-slate-500">Enter your details below to continue.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-6 text-sm flex items-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary rounded-xl outline-none px-4 py-3 placeholder-slate-400 transition-all"
                                placeholder="name@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary rounded-xl outline-none px-4 py-3 placeholder-slate-400 transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full bg-primary text-white py-3.5 rounded-xl hover:bg-primary-hover transition-colors font-semibold shadow-sm"
                            >
                                Sign In
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-600">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-primary font-semibold hover:underline underline-offset-2">
                                Sign up here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}