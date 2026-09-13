import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api';
import { ArrowLeft, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
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

export default function ResetPassword() {
    const [searchParams]          = useSearchParams();
    const token                   = searchParams.get('token') || '';
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPw, setShowPw]     = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState('');
    const [success, setSuccess]   = useState(false);
    const navigate = useNavigate();

    // Guard: no token in URL
    if (!token) {
        return (
            <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Roboto, Inter, sans-serif', padding: 32 }}>
                <div style={{ textAlign: 'center', maxWidth: 400 }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🔗</div>
                    <h1 style={{ fontSize: 22, fontWeight: 800, color: '#f1f1f1', marginBottom: 10 }}>Invalid reset link</h1>
                    <p style={{ color: '#666', fontSize: 14, marginBottom: 24 }}>This link is missing the reset token. Please request a new password reset link.</p>
                    <Link to="/forgot-password" style={{ color: '#00C2CB', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>Request a new link →</Link>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password', { token, newPassword });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(getErrorMessage(err, 'Reset failed. The link may have expired.'));
        } finally {
            setLoading(false);
        }
    };

    // Strength indicator
    const strength = (() => {
        if (!newPassword) return { label: '', color: '#333', width: '0%' };
        if (newPassword.length < 6) return { label: 'Too short', color: '#ef4444', width: '20%' };
        if (newPassword.length < 8) return { label: 'Weak', color: '#f97316', width: '40%' };
        const hasUpper = /[A-Z]/.test(newPassword);
        const hasNum = /\d/.test(newPassword);
        const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
        const score = [hasUpper, hasNum, hasSpecial].filter(Boolean).length;
        if (score === 0) return { label: 'Fair', color: '#eab308', width: '60%' };
        if (score === 1) return { label: 'Good', color: '#22c55e', width: '80%' };
        return { label: 'Strong', color: '#00C2CB', width: '100%' };
    })();

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
            <div style={{ position: 'absolute', top: -120, right: '25%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,194,203,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -140, left: '20%', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(62,166,255,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

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
                <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#555', fontSize: 13, fontWeight: 500, textDecoration: 'none', marginBottom: 28, transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#00C2CB'}
                    onMouseLeave={e => e.currentTarget.style.color = '#555'}>
                    <ArrowLeft size={14} /> Back to Login
                </Link>

                <div style={{ marginBottom: 28 }}>
                    <HiveLogo size={36} fontSize={22} />
                </div>

                {!success ? (
                    <>
                        <div style={{ marginBottom: 28 }}>
                            <div style={{ width: 50, height: 50, borderRadius: 14, background: 'rgba(0,194,203,0.1)', border: '1px solid rgba(0,194,203,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                                <Lock size={22} color="#00C2CB" />
                            </div>
                            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f1f1f1', margin: '0 0 8px', letterSpacing: '-0.4px' }}>
                                Set a new password
                            </h1>
                            <p style={{ fontSize: 14, color: '#666', margin: 0, lineHeight: 1.6 }}>
                                Choose a strong password you haven't used before.
                            </p>
                        </div>

                        {error && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 20 }}>
                                <AlertCircle size={15} /> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            {/* New Password */}
                            <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#aaa', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>New Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPw ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        style={{ ...inputStyle, paddingRight: 46 }}
                                        onFocus={e => e.target.style.borderColor = '#00C2CB'}
                                        onBlur={e => e.target.style.borderColor = '#2e2e2e'}
                                    />
                                    <button type="button" onClick={() => setShowPw(!showPw)}
                                        style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: 0 }}>
                                        {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                                    </button>
                                </div>
                                {/* Strength bar */}
                                {newPassword && (
                                    <div style={{ marginTop: 8 }}>
                                        <div style={{ height: 3, background: '#1e1e1e', borderRadius: 4, overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: strength.width, background: strength.color, transition: 'width 0.3s, background 0.3s', borderRadius: 4 }} />
                                        </div>
                                        <span style={{ fontSize: 11, color: strength.color, fontWeight: 600, marginTop: 4, display: 'block' }}>{strength.label}</span>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#aaa', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Confirm Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showConfirm ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        style={{ ...inputStyle, paddingRight: 46, borderColor: confirmPassword && confirmPassword !== newPassword ? 'rgba(239,68,68,0.6)' : undefined }}
                                        onFocus={e => e.target.style.borderColor = '#00C2CB'}
                                        onBlur={e => e.target.style.borderColor = (confirmPassword && confirmPassword !== newPassword) ? 'rgba(239,68,68,0.6)' : '#2e2e2e'}
                                    />
                                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                        style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: 0 }}>
                                        {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                                    </button>
                                </div>
                                {confirmPassword && confirmPassword !== newPassword && (
                                    <span style={{ fontSize: 11, color: '#f87171', marginTop: 4, display: 'block' }}>Passwords don't match</span>
                                )}
                            </div>

                            <button type="submit" disabled={loading} style={{ marginTop: 4, width: '100%', padding: '13px 0', borderRadius: 10, border: 'none', background: loading ? '#0d3030' : '#00C2CB', color: loading ? '#555' : '#0a0a0a', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}
                                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#00d6e0'; }}
                                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#00C2CB'; }}>
                                {loading ? 'Resetting password…' : 'Reset Password →'}
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
                            Password reset!
                        </h2>
                        <p style={{ fontSize: 14, color: '#888', lineHeight: 1.7, marginBottom: 4 }}>
                            Your password has been updated successfully.
                        </p>
                        <p style={{ fontSize: 13, color: '#555' }}>Redirecting you to login…</p>
                        <div style={{ marginTop: 28 }}>
                            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#00C2CB', color: '#0a0a0a', fontWeight: 700, fontSize: 14, padding: '12px 24px', borderRadius: 10, textDecoration: 'none' }}>
                                Go to Login →
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
