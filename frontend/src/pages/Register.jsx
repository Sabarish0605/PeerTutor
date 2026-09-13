import { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api, { getErrorMessage } from '../services/api';
import { Eye, EyeOff, Sparkles, AlertCircle, ArrowLeft, Mail, RefreshCw, CheckCircle2 } from 'lucide-react';
import HiveLogo from '../components/HiveLogo';

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

// ── OTP digit input component ──────────────────────────────────────────────
function OtpInput({ value, onChange }) {
    const digits = value.split('');
    const inputRefs = useRef([]);

    const handleKeyDown = (i, e) => {
        if (e.key === 'Backspace' && !digits[i] && i > 0) {
            inputRefs.current[i - 1]?.focus();
        }
    };

    const handleChange = (i, e) => {
        const char = e.target.value.replace(/\D/g, '').slice(-1);
        const next = [...digits];
        next[i] = char;
        onChange(next.join(''));
        if (char && i < 5) inputRefs.current[i + 1]?.focus();
    };

    const handlePaste = (e) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        onChange(pasted.padEnd(6, '').slice(0, 6));
        if (pasted.length === 6) inputRefs.current[5]?.focus();
        e.preventDefault();
    };

    return (
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            {Array.from({ length: 6 }).map((_, i) => (
                <input
                    key={i}
                    ref={el => inputRefs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digits[i] || ''}
                    onChange={e => handleChange(i, e)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    style={{
                        width: 52,
                        height: 58,
                        textAlign: 'center',
                        fontSize: 24,
                        fontWeight: 700,
                        background: '#141414',
                        border: `2px solid ${digits[i] ? '#00C2CB' : '#2e2e2e'}`,
                        borderRadius: 12,
                        color: '#f1f1f1',
                        outline: 'none',
                        fontFamily: 'inherit',
                        transition: 'border-color 0.15s',
                        caretColor: '#00C2CB',
                    }}
                    onFocus={e => { e.target.style.borderColor = '#00C2CB'; e.target.style.boxShadow = '0 0 0 3px rgba(0,194,203,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = digits[i] ? '#00C2CB' : '#2e2e2e'; e.target.style.boxShadow = 'none'; }}
                />
            ))}
        </div>
    );
}

export default function Register() {
    const [step, setStep]           = useState(1);   // 1 = form, 2 = OTP
    const [formData, setFormData]   = useState({ name: '', email: '', password: '' });
    const [otp, setOtp]             = useState('');
    const [showPw, setShowPw]       = useState(false);
    const [error, setError]         = useState('');
    const [loading, setLoading]     = useState(false);
    const [resending, setResending] = useState(false);
    const [resendMsg, setResendMsg] = useState('');
    const [countdown, setCountdown] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useContext(AuthContext);

    // Countdown timer for resend button
    useEffect(() => {
        if (countdown <= 0) return;
        const t = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown]);

    // If navigated here from Login with { step: 2, email }, jump straight to OTP step
    useEffect(() => {
        const state = location.state;
        if (state?.step === 2 && state?.email) {
            setFormData(prev => ({ ...prev, email: state.email }));
            setStep(2);
            setCountdown(30);
            // Clear the router state so a page refresh starts fresh
            window.history.replaceState({}, '');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Step 1: Register ─────────────────────────────────────────────────────
    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.post('/auth/register', formData);
            setStep(2);
            setCountdown(30);
        } catch (err) {
            setError(getErrorMessage(err, 'Registration failed. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    // ── Step 2: Verify OTP ───────────────────────────────────────────────────
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (otp.length < 6) { setError('Please enter the full 6-digit code'); return; }
        setError('');
        setLoading(true);
        try {
            const response = await api.post('/auth/verify-otp', { email: formData.email, otp });
            login(response.data, response.data.token);
            navigate('/discover');
        } catch (err) {
            setError(getErrorMessage(err, 'Verification failed. Check the code and try again.'));
        } finally {
            setLoading(false);
        }
    };

    // ── Resend OTP ───────────────────────────────────────────────────────────
    const handleResend = async () => {
        setResending(true);
        setResendMsg('');
        setError('');
        try {
            await api.post('/auth/resend-otp', { email: formData.email });
            setOtp('');
            setResendMsg('A new code has been sent!');
            setCountdown(30);
        } catch (err) {
            setError(getErrorMessage(err, 'Could not resend OTP. Please try again.'));
        } finally {
            setResending(false);
        }
    };

    // ── Left panel (shared) ───────────────────────────────────────────────────
    const LeftPanel = () => (
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
        }} className="register-left-panel">
            {/* Grid pattern */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'linear-gradient(rgba(0,194,203,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,194,203,0.03) 1px, transparent 1px)',
                backgroundSize: '48px 48px',
                pointerEvents: 'none',
            }} />

            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#666', fontSize: 13, fontWeight: 500, textDecoration: 'none', zIndex: 1, transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#00C2CB'}
                onMouseLeave={e => e.currentTarget.style.color = '#666'}
            >
                <ArrowLeft size={15} /> Back to Home
            </Link>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', zIndex: 1 }}>
                <HiveLogo size={52} fontSize={32} />
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: '#00C2CB', textTransform: 'uppercase', marginTop: 14, marginBottom: 14, background: 'rgba(0,194,203,0.1)', border: '1px solid rgba(0,194,203,0.25)', borderRadius: 20, padding: '4px 14px', display: 'inline-block' }}>
                    Student · Tutor · Community
                </p>
                <h1 style={{ fontSize: 32, fontWeight: 800, color: '#f1f1f1', margin: '0 0 12px', lineHeight: 1.2, letterSpacing: '-0.5px' }}>
                    Join Hive.
                </h1>
                <p style={{ fontSize: 14, color: '#888', lineHeight: 1.7, maxWidth: 280 }}>
                    Create your free account. Learn from peers, share your expertise, and grow your skills together.
                </p>

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
                Hive © {new Date().getFullYear()}
            </div>
        </div>
    );

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

            <LeftPanel />

            {/* ── Right panel ─────────────────────────────────────────────────── */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 32px', background: '#0f0f0f' }}>
                <div style={{ width: '100%', maxWidth: 420 }}>

                    {/* Step indicator */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
                        {[1, 2].map(s => (
                            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{
                                    width: 28, height: 28, borderRadius: '50%',
                                    background: step >= s ? '#00C2CB' : '#1e1e1e',
                                    border: `2px solid ${step >= s ? '#00C2CB' : '#333'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 12, fontWeight: 700,
                                    color: step >= s ? '#0a0a0a' : '#555',
                                    transition: 'all 0.2s',
                                }}>
                                    {step > s ? <CheckCircle2 size={14} /> : s}
                                </div>
                                <span style={{ fontSize: 12, color: step >= s ? '#aaa' : '#444' }}>
                                    {s === 1 ? 'Your Details' : 'Verify Email'}
                                </span>
                                {s < 2 && <div style={{ width: 32, height: 1, background: step > s ? '#00C2CB' : '#2a2a2a', transition: 'background 0.3s' }} />}
                            </div>
                        ))}
                    </div>

                    {/* Error banner */}
                    {error && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 20 }}>
                            <AlertCircle size={15} /> {error}
                        </div>
                    )}

                    {/* ── STEP 1: Account Details ──────────────────────────────── */}
                    {step === 1 && (
                        <>
                            <div style={{ marginBottom: 28 }}>
                                <h2 style={{ fontSize: 26, fontWeight: 800, color: '#f1f1f1', margin: '0 0 6px', letterSpacing: '-0.4px' }}>Join Hive</h2>
                                <p style={{ fontSize: 14, color: '#666', margin: 0 }}>Sign up below and start learning in minutes.</p>
                            </div>

                            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
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
                                            minLength={6}
                                            style={{ ...inputStyle, paddingRight: 46 }}
                                            onFocus={e => e.target.style.borderColor = '#00C2CB'}
                                            onBlur={e => e.target.style.borderColor = '#2e2e2e'}
                                        />
                                        <button type="button" onClick={() => setShowPw(!showPw)}
                                            style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: 0 }}>
                                            {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                                        </button>
                                    </div>
                                </div>

                                <button type="submit" disabled={loading} style={{ marginTop: 4, width: '100%', padding: '13px 0', borderRadius: 10, border: 'none', background: loading ? '#0d3030' : '#00C2CB', color: loading ? '#555' : '#0a0a0a', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}
                                    onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#00d6e0'; }}
                                    onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#00C2CB'; }}>
                                    {loading ? 'Sending verification code…' : 'Continue →'}
                                </button>
                            </form>

                            <p style={{ marginTop: 28, textAlign: 'center', fontSize: 14, color: '#555' }}>
                                Already have an account?{' '}
                                <Link to="/login" style={{ color: '#00C2CB', fontWeight: 600, textDecoration: 'none' }}
                                    onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                                    onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                                    Log in here
                                </Link>
                            </p>
                            <p style={{ marginTop: 16, textAlign: 'center', fontSize: 11, color: '#444', lineHeight: 1.6 }}>
                                By signing up you agree to our Terms of Service and Privacy Policy.
                            </p>
                        </>
                    )}

                    {/* ── STEP 2: OTP Verification ─────────────────────────────── */}
                    {step === 2 && (
                        <>
                            <div style={{ marginBottom: 28 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                                    <div style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(0,194,203,0.1)', border: '1px solid rgba(0,194,203,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Mail size={20} color="#00C2CB" />
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f1f1f1', margin: 0, letterSpacing: '-0.3px' }}>Check your email</h2>
                                        <p style={{ fontSize: 13, color: '#666', margin: 0 }}>We sent a 6-digit code to</p>
                                    </div>
                                </div>
                                <div style={{ background: 'rgba(0,194,203,0.06)', border: '1px solid rgba(0,194,203,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 14, color: '#00C2CB', fontWeight: 600, wordBreak: 'break-all' }}>
                                    {formData.email}
                                </div>
                            </div>

                            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#aaa', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center' }}>
                                        Verification Code
                                    </label>
                                    <OtpInput value={otp} onChange={setOtp} />
                                </div>

                                {/* ── Spam folder callout ── */}
                                <div style={{
                                    display: 'flex',
                                    gap: 12,
                                    background: 'rgba(234,179,8,0.07)',
                                    border: '1px solid rgba(234,179,8,0.28)',
                                    borderRadius: 10,
                                    padding: '12px 14px',
                                }}>
                                    <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>⚠️</span>
                                    <p style={{ margin: 0, fontSize: 12, color: '#b8860b', lineHeight: 1.65 }}>
                                        <strong style={{ color: '#d4a017', fontWeight: 700 }}>Don't see the email?</strong>
                                        {' '}Check your <strong style={{ color: '#d4a017' }}>Spam</strong> or <strong style={{ color: '#d4a017' }}>Junk</strong> folder.
                                        If it's there, please mark it as <strong style={{ color: '#d4a017' }}>"Not Spam"</strong> so future class reminders land in your inbox!
                                    </p>
                                </div>

                                <button type="submit" disabled={loading || otp.length < 6} style={{ width: '100%', padding: '13px 0', borderRadius: 10, border: 'none', background: (loading || otp.length < 6) ? '#0d3030' : '#00C2CB', color: (loading || otp.length < 6) ? '#555' : '#0a0a0a', fontSize: 14, fontWeight: 700, cursor: (loading || otp.length < 6) ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}
                                    onMouseEnter={e => { if (!loading && otp.length === 6) e.currentTarget.style.background = '#00d6e0'; }}
                                    onMouseLeave={e => { if (!loading && otp.length === 6) e.currentTarget.style.background = '#00C2CB'; }}>
                                    {loading ? 'Verifying…' : 'Verify & Create Account →'}
                                </button>
                            </form>

                            {/* Resend section */}
                            <div style={{ marginTop: 24, textAlign: 'center' }}>
                                {resendMsg && (
                                    <p style={{ fontSize: 13, color: '#00C2CB', marginBottom: 10 }}>{resendMsg}</p>
                                )}
                                <p style={{ fontSize: 13, color: '#555', marginBottom: 10 }}>Didn't receive the code?</p>
                                <button
                                    onClick={handleResend}
                                    disabled={resending || countdown > 0}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid #2e2e2e', borderRadius: 8, padding: '8px 16px', color: (resending || countdown > 0) ? '#444' : '#00C2CB', fontSize: 13, fontWeight: 600, cursor: (resending || countdown > 0) ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
                                >
                                    <RefreshCw size={13} style={{ animation: resending ? 'spin 0.8s linear infinite' : 'none' }} />
                                    {resending ? 'Sending…' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                                </button>
                            </div>

                            <p style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: '#444' }}>
                                Wrong email?{' '}
                                <button onClick={() => { setStep(1); setError(''); setOtp(''); }} style={{ background: 'none', border: 'none', color: '#00C2CB', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
                                    Go back
                                </button>
                            </p>
                        </>
                    )}
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .register-left-panel { display: none !important; }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}