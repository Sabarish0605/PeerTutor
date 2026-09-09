import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Eye, EyeOff } from 'lucide-react';

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
                navigate('/discover'); // Home redirects here or similar
            }
        } catch (err) {
            setError('Invalid email or password. Please verify your credentials.');
        }
    };

    return (
        <div className="w-full min-h-screen bg-transparent text-gray-900 flex flex-col md:flex-row">
            {/* Left side - Editorial Statement */}
            <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-300">
                <div>
                    <Link to="/" className="text-gray-600 hover:text-gray-900 transition-colors text-sm uppercase tracking-widest font-semibold flex items-center gap-2">
                        <span>←</span> Return to Index
                    </Link>
                </div>
                
                <div className="my-16 md:my-0">
                    <h1 className="font-serif text-5xl md:text-7xl leading-tight mb-6">
                        Knowledge is a <br className="hidden md:block"/>
                        shared currency.
                    </h1>
                    <p className="text-gray-600 text-lg max-w-md font-serif italic">
                        "The best way to master a subject is to teach it to someone else. The second best way is to learn from someone who just mastered it."
                    </p>
                </div>

                <div className="text-gray-500 text-sm border-t border-gray-300 pt-4">
                    PeerTutor Network &copy; {new Date().getFullYear()}
                </div>
            </div>

            {/* Right side - Form */}
            <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-transparent">
                <div className="max-w-md w-full mx-auto bg-gray-100 shadow-lg border border-gray-300 rounded-2xl p-8">
                    <h2 className="text-3xl font-serif mb-2">Authentication</h2>
                    <p className="text-gray-600 mb-10 text-sm">Enter your credentials to access the ledger.</p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 rounded p-4 mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="group">
                            <label className="block text-xs uppercase tracking-widest text-gray-600 mb-2 transition-colors">
                                Electronic Mail
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-200 border border-gray-400 text-gray-900 focus:ring-2 focus:ring-gray-500 rounded-lg outline-none px-4 py-3 font-sans placeholder-gray-500"
                                placeholder="name@institution.edu"
                                required
                            />
                        </div>

                        <div className="group">
                            <label className="block text-xs uppercase tracking-widest text-gray-600 mb-2 transition-colors">
                                Security Passphrase
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-gray-200 border border-gray-400 text-gray-900 focus:ring-2 focus:ring-gray-500 rounded-lg outline-none px-4 py-3 font-sans"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gray-800 text-white py-4 rounded-xl hover:bg-gray-900 transition-colors font-semibold tracking-wide mt-4"
                        >
                            Sign In
                        </button>
                    </form>

                    <div className="mt-8 text-sm text-gray-600 text-center border-t border-gray-300 pt-6">
                        Not a registered member?{' '}
                        <Link to="/register" className="text-gray-900 font-semibold hover:underline underline-offset-4">
                            Apply here.
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}