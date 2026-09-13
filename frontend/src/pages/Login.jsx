import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api, { getErrorMessage } from '../services/api';
import { Eye, EyeOff, AlertCircle, ArrowLeft, Sparkles, BookOpen, Users, ArrowRight, MailCheck } from 'lucide-react';
import HiveLogo from '../components/HiveLogo';

/* ── Inline styles reused across the form ── */
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

export default function Login() {
    const [email, setEmail]               = useState('');
    const [password, setPassword]         = useState('');
    const [showPw, setShowPw]             = useState(false);
    const [error, setError]               = useState('');
    const [loading, setLoading]           = useState(false);
    const [unverifiedEmail, setUnverifiedEmail] = useState(''); // tracks unverified attempts
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setUnverifiedEmail('');
        setLoading(true);
        try {
            const response = await api.post('/auth/login', { email, password });
            const data = response.data;
            login(data, data.token);
            navigate('/discover');
        } catch (err) {
            const msg = err?.response?.data?.message || '';
            if (msg === 'UNVERIFIED_ACCOUNT' || msg.includes('disabled')) {
                // Surface a targeted verify-email prompt instead of a generic error
                setUnverifiedEmail(email);
            } else {
                setError(getErrorMessage(err, 'Invalid email or password. Please verify your credentials.'));
            }
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
            <div style={{ position: 'absolute', top: -120, left: -120, width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,194,203,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -160, right: -80, width: 540, height: 540, borderRadius: '50%', background: 'radial-gradient(circle, rgba(62,166,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

            {/* ── Left panel ── */}
            <div style={{
                width: '42%',
                background: 'linear-gradient(160deg, #111a24 0%, #0d1520 50%, #0a0a0a 100%)',
                borderRight: '1px solid #1e2e3e',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '40px 48px',
                position: 'relative',
                overflow: 'hidden',
            }}
            className="login-left-panel"
            >
                {/* Grid pattern */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'linear-gradient(rgba(0,194,203,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,194,203,0.04) 1px, transparent 1px)',
                    backgroundSize: '48px 48px',
                    pointerEvents: 'none',
                }} />

                {/* Back link */}
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#666', fontSize: 13, fontWeight: 500, textDecoration: 'none', zIndex: 1, transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#00C2CB'}
                    onMouseLeave={e => e.currentTarget.style.color = '#666'}
                >
                    <ArrowLeft size={15} /> Back to Home
                </Link>

                {/* Central identity block */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', zIndex: 1 }}>
                    {/* Logo glow orb */}
                    <HiveLogo size={52} fontSize={32} />
                    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: '#00C2CB', textTransform: 'uppercase', marginTop: 14, marginBottom: 14,
                        background: 'rgba(0,194,203,0.1)', border: '1px solid rgba(0,194,203,0.25)',
                        borderRadius: 20, padding: '4px 14px', display: 'inline-block',
                    }}>
                        Peer Learning Platform
                    </p>

                    <h1 style={{ fontSize: 32, fontWeight: 800, color: '#f1f1f1', margin: '0 0 12px', lineHeight: 1.2, letterSpacing: '-0.5px' }}>
                        Welcome Back.
                    </h1>
                    <p style={{ fontSize: 14, color: '#888', lineHeight: 1.7, maxWidth: 280 }}>
                        Continue your learning journey. Your courses, tutors and progress are waiting for you.
                    </p>

                    {/* Stats strip */}
                    <div style={{
                        display: 'flex', gap: 24, marginTop: 40,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid #1e2e3e',
                        borderRadius: 14, padding: '16px 28px',
                    }}>
                        {[
                            { val: '2.4K+', label: 'Students' },
                            { val: '180+', label: 'Courses' },
                            { val: '4.9★', label: 'Rating' },
                        ].map(s => (
                            <div key={s.label} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 18, fontWeight: 800, color: '#00C2CB' }}>{s.val}</div>
                                <div style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ fontSize: 12, color: '#444', zIndex: 1 }}>
                    Hive © {new Date().getFullYear()}
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

                    {/* Heading */}
                    <div style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#f1f1f1', margin: '0 0 6px', letterSpacing: '-0.4px' }}>
                            Log in to your account
                        </h2>
                        <p style={{ fontSize: 14, color: '#666', margin: 0 }}>
                            Enter your details below to continue.
                        </p>
                    </div>

                    {/* Unverified account banner */}
                    {unverifiedEmail && (
                        <div style={{
                            background: 'rgba(234,179,8,0.07)',
                            border: '1px solid rgba(234,179,8,0.3)',
                            borderRadius: 12,
                            padding: '14px 16px',
                            marginBottom: 20,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                <MailCheck size={16} color="#eab308" />
                                <span style={{ fontSize: 13, color: '#eab308', fontWeight: 600 }}>Email not verified</span>
                            </div>
                            <p style={{ fontSize: 13, color: '#999', margin: '0 0 12px', lineHeight: 1.55 }}>
                                <strong style={{ color: '#ccc' }}>{unverifiedEmail}</strong> hasn't been verified yet.
                                Enter the OTP we sent during registration to activate your account.
                            </p>
                            <button
                                onClick={() => navigate('/register', { state: { email: unverifiedEmail, step: 2 } })}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.35)',
                                    borderRadius: 8, padding: '8px 14px',
                                    color: '#eab308', fontSize: 13, fontWeight: 700,
                                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(234,179,8,0.2)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(234,179,8,0.12)'}
                            >
                                <MailCheck size={13} /> Verify my email →
                            </button>
                        </div>
                    )}

                    {/* Generic error */}
                    {error && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
                            color: '#f87171', borderRadius: 10, padding: '10px 14px',
                            fontSize: 13, marginBottom: 20,
                        }}>
                            <AlertCircle size={15} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        {/* Email */}
                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#aaa', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                required
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = '#00C2CB'}
                                onBlur={e => e.target.style.borderColor = '#2e2e2e'}
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                    Password
                                </label>
                                <Link
                                    to="/forgot-password"
                                    style={{ fontSize: 12, color: '#00C2CB', fontWeight: 500, textDecoration: 'none', opacity: 0.85, transition: 'opacity 0.15s' }}
                                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                    onMouseLeave={e => e.currentTarget.style.opacity = '0.85'}
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    style={{ ...inputStyle, paddingRight: 46 }}
                                    onFocus={e => e.target.style.borderColor = '#00C2CB'}
                                    onBlur={e => e.target.style.borderColor = '#2e2e2e'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(!showPw)}
                                    style={{
                                        position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: 0,
                                    }}
                                >
                                    {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </div>
                        </div>


                        {/* Submit */}
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
                                transition: 'background 0.15s, transform 0.1s',
                                letterSpacing: '0.02em',
                            }}
                            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#00d6e0'; }}
                            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#00C2CB'; }}
                        >
                            {loading ? 'Signing in…' : 'Sign In →'}
                        </button>
                    </form>

                    {/* Footer link */}
                    <p style={{ marginTop: 28, textAlign: 'center', fontSize: 14, color: '#555' }}>
                        Don't have an account?{' '}
                        <Link to="/register" style={{ color: '#00C2CB', fontWeight: 600, textDecoration: 'none' }}
                            onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                            onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                        >
                            Sign up here
                        </Link>
                    </p>

                    {/* Divider */}
                    <div style={{ marginTop: 32, borderTop: '1px solid #1e1e1e', paddingTop: 24, textAlign: 'center' }}>
                        <p style={{ fontSize: 12, color: '#444' }}>
                            Are you a tutor?{' '}
                            <Link to="/tutor/onboarding" style={{ color: '#3ea6ff', fontWeight: 600, textDecoration: 'none' }}>
                                Upgrade your account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .login-left-panel { display: none !important; }
                }
            `}</style>
        </div>
    );
}