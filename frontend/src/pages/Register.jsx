import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Eye, EyeOff, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';
import FluxLogo from '../components/FluxLogo';

const inputStyle = {
    width: '100%',
    background: '#141414',
    border: '1px solid #2e2e2e',
    borderRadius: 10,
    padding: '11px 14px',
    color: '#f1f1f1',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s',
};

export default function Register() {
    const [formData, setFormData]   = useState({ name: '', email: '', password: '' });
    const [showPw, setShowPw]       = useState(false);
    const [error, setError]         = useState('');
    const [loading, setLoading]     = useState(false);
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await api.post('/auth/register', formData);
            login(response.data, response.data.token);
            navigate('/discover');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0a0a0a',
            display: 'flex',
            alignItems: 'stretch',
            fontFamily: 'Roboto, Inter, sans-serif',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Ambient glows */}
            <div style={{ position: 'absolute', top: -100, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,194,203,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -160, left: -80, width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(62,166,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

            {/* ── Left panel ── */}
            <div style={{
                width: '42%',
                background: 'linear-gradient(160deg, #0d1a12 0%, #0a130e 50%, #0a0a0a 100%)',
                borderRight: '1px solid #1a2a1e',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '40px 48px',
                position: 'relative',
                overflow: 'hidden',
            }}
            className="register-left-panel"
            >
                {/* Grid pattern */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'linear-gradient(rgba(0,194,203,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,194,203,0.03) 1px, transparent 1px)',
                    backgroundSize: '48px 48px',
                    pointerEvents: 'none',
                }} />

                {/* Back */}
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#666', fontSize: 13, fontWeight: 500, textDecoration: 'none', zIndex: 1, transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#00C2CB'}
                    onMouseLeave={e => e.currentTarget.style.color = '#666'}
                >
                    <ArrowLeft size={15} /> Back to Home
                </Link>

                {/* Central content */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', zIndex: 1 }}>
                    <FluxLogo size={52} fontSize={32} />
                    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: '#00C2CB', textTransform: 'uppercase', marginTop: 14, marginBottom: 14,
                        background: 'rgba(0,194,203,0.1)', border: '1px solid rgba(0,194,203,0.25)',
                        borderRadius: 20, padding: '4px 14px', display: 'inline-block',
                    }}>
                        Student · Tutor · Community
                    </p>

                    <h1 style={{ fontSize: 32, fontWeight: 800, color: '#f1f1f1', margin: '0 0 12px', lineHeight: 1.2, letterSpacing: '-0.5px' }}>
                        Join FLUX.
                    </h1>
                    <p style={{ fontSize: 14, color: '#888', lineHeight: 1.7, maxWidth: 280 }}>
                        Create your free account. Learn from peers, share your expertise, and grow your skills together.
                    </p>

                    {/* Feature checklist */}
                    <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 280 }}>
                        {[
                            'Access 180+ peer-led courses',
                            'Live sessions with real tutors',
                            'Earn by teaching what you know',
                        ].map(item => (
                            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid #1a2a1e', borderRadius: 10, padding: '10px 14px', textAlign: 'left' }}>
                                <Sparkles size={13} color="#00C2CB" />
                                <span style={{ fontSize: 13, color: '#bbb' }}>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ fontSize: 12, color: '#444', zIndex: 1 }}>
                    FLUX © {new Date().getFullYear()}
                </div>
            </div>

            {/* ── Right panel – Form ── */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '48px 32px',
                background: '#0f0f0f',
            }}>
                <div style={{ width: '100%', maxWidth: 420 }}>

                    <div style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#f1f1f1', margin: '0 0 6px', letterSpacing: '-0.4px' }}>
                            Join FLUX
                        </h2>
                        <p style={{ fontSize: 14, color: '#666', margin: 0 }}>
                            Sign up below and start learning in minutes.
                        </p>
                    </div>

                    {error && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
                            color: '#f87171', borderRadius: 10, padding: '10px 14px',
                            fontSize: 13, marginBottom: 20,
                        }}>
                            <AlertCircle size={15} /> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#aaa', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Full Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Alex Johnson"
                                required
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = '#00C2CB'}
                                onBlur={e => e.target.style.borderColor = '#2e2e2e'}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#aaa', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email Address</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder="name@example.com"
                                required
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = '#00C2CB'}
                                onBlur={e => e.target.style.borderColor = '#2e2e2e'}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#aaa', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                    required
                                    style={{ ...inputStyle, paddingRight: 46 }}
                                    onFocus={e => e.target.style.borderColor = '#00C2CB'}
                                    onBlur={e => e.target.style.borderColor = '#2e2e2e'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(!showPw)}
                                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: 0 }}
                                >
                                    {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                marginTop: 4,
                                width: '100%',
                                padding: '13px 0',
                                borderRadius: 10,
                                border: 'none',
                                background: loading ? '#0d3030' : '#00C2CB',
                                color: loading ? '#555' : '#0a0a0a',
                                fontSize: 14,
                                fontWeight: 700,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontFamily: 'inherit',
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#00d6e0'; }}
                            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#00C2CB'; }}
                        >
                            {loading ? 'Creating Account…' : 'Create Account →'}
                        </button>
                    </form>

                    <p style={{ marginTop: 28, textAlign: 'center', fontSize: 14, color: '#555' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: '#00C2CB', fontWeight: 600, textDecoration: 'none' }}
                            onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                            onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                        >
                            Log in here
                        </Link>
                    </p>

                    <p style={{ marginTop: 16, textAlign: 'center', fontSize: 11, color: '#444', lineHeight: 1.6 }}>
                        By signing up you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .register-left-panel { display: none !important; }
                }
            `}</style>
        </div>
    );
}