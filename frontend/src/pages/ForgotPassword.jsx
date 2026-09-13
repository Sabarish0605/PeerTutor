import { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api';
import { ArrowLeft, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
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

export default function ForgotPassword() {
    const [email, setEmail]     = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState('');
    const [sent, setSent]       = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            setSent(true);
        } catch (err) {
            setError(getErrorMessage(err, 'Something went wrong. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0a0a0a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Roboto, Inter, sans-serif',
            padding: '32px 16px',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Ambient glows */}
            <div style={{ position: 'absolute', top: -140, left: '30%', width: 540, height: 540, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,194,203,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -160, right: '20%', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(62,166,255,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div style={{
                width: '100%',
                maxWidth: 440,
                background: '#111111',
                border: '1px solid #1e1e1e',
                borderRadius: 20,
                padding: '40px 36px',
                position: 'relative',
                zIndex: 1,
            }}>
                {/* Back link */}
                <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#555', fontSize: 13, fontWeight: 500, textDecoration: 'none', marginBottom: 28, transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#00C2CB'}
                    onMouseLeave={e => e.currentTarget.style.color = '#555'}>
                    <ArrowLeft size={14} /> Back to Login
                </Link>

                {/* Logo */}
                <div style={{ marginBottom: 28 }}>
                    <HiveLogo size={36} fontSize={22} />
                </div>

                {!sent ? (
                    <>
                        <div style={{ marginBottom: 28 }}>
                            <div style={{ width: 50, height: 50, borderRadius: 14, background: 'rgba(0,194,203,0.1)', border: '1px solid rgba(0,194,203,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                                <Mail size={22} color="#00C2CB" />
                            </div>
                            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f1f1f1', margin: '0 0 8px', letterSpacing: '-0.4px' }}>
                                Forgot your password?
                            </h1>
                            <p style={{ fontSize: 14, color: '#666', margin: 0, lineHeight: 1.6 }}>
                                No worries. Enter your email and we'll send you a reset link if an account exists.
                            </p>
                        </div>

                        {error && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 20 }}>
                                <AlertCircle size={15} /> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
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

                            <button
                                type="submit"
                                disabled={loading}
                                style={{ width: '100%', padding: '13px 0', borderRadius: 10, border: 'none', background: loading ? '#0d3030' : '#00C2CB', color: loading ? '#555' : '#0a0a0a', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}
                                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#00d6e0'; }}
                                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#00C2CB'; }}>
                                {loading ? 'Sending reset link…' : 'Send Reset Link →'}
                            </button>
                        </form>
                    </>
                ) : (
                    /* Success state */
                    <div style={{ textAlign: 'center', padding: '8px 0' }}>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(0,194,203,0.1)', border: '2px solid rgba(0,194,203,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <CheckCircle2 size={28} color="#00C2CB" />
                        </div>
                        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f1f1f1', margin: '0 0 10px', letterSpacing: '-0.3px' }}>
                            Check your inbox
                        </h2>
                        <p style={{ fontSize: 14, color: '#888', lineHeight: 1.7, marginBottom: 8 }}>
                            If <strong style={{ color: '#aaa' }}>{email}</strong> is registered, we've sent a password reset link. It expires in 15 minutes.
                        </p>
                        <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>
                            Didn't receive it? Check your spam folder or{' '}
                            <button onClick={() => setSent(false)} style={{ background: 'none', border: 'none', color: '#00C2CB', fontWeight: 600, cursor: 'pointer', padding: 0, fontSize: 13, fontFamily: 'inherit' }}>
                                try again
                            </button>.
                        </p>

                        <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #1e1e1e' }}>
                            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#00C2CB', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
                                onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                                onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                                <ArrowLeft size={14} /> Back to Login
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
