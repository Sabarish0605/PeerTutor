import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api, { getErrorMessage } from '../services/api';
import { toast } from 'react-hot-toast';
import { Wallet, BookOpen, BadgeCheck, Zap } from 'lucide-react';
import HiveLogo from '../components/HiveLogo';

const inputBase = {
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
    resize: 'vertical',
    transition: 'border-color 0.15s',
};

export default function TutorOnboarding() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ bio: '', experience: '', upiId: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/tutors/onboard', formData);
            login(response.data, response.data.token);
            toast.success('Successfully upgraded to Tutor!');
            navigate('/tutor/dashboard');
        } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to upgrade to tutor.'));
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
            padding: '48px 20px',
            fontFamily: 'Roboto, Inter, sans-serif',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Glow */}
            <div style={{ position: 'absolute', top: -120, left: '50%', transform: 'translateX(-50%)', width: 600, height: 350, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(0,194,203,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(62,166,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div style={{ width: '100%', maxWidth: 560, position: 'relative', zIndex: 1 }}>

                {/* Header block */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{ display: 'inline-flex', marginBottom: 20 }}>
                        <HiveLogo size={56} fontSize={40} />
                    </div>
                    <div style={{
                        display: 'inline-block', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
                        color: '#00C2CB', textTransform: 'uppercase', marginBottom: 14,
                        background: 'rgba(0,194,203,0.1)', border: '1px solid rgba(0,194,203,0.25)',
                        borderRadius: 20, padding: '4px 14px', display: 'block',
                    }}>
                        Become a Tutor
                    </div>
                    <h1 style={{ fontSize: 30, fontWeight: 800, color: '#f1f1f1', margin: '0 0 10px', letterSpacing: '-0.5px' }}>
                        Share Your Knowledge
                    </h1>
                    <p style={{ fontSize: 14, color: '#888', lineHeight: 1.7, maxWidth: 400, margin: '0 auto' }}>
                        Help your peers master difficult subjects and start earning on your own schedule.
                    </p>
                </div>

                {/* Perks strip */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 32,
                }}>
                    {[
                        { icon: <BookOpen size={18} color="#00C2CB" />, label: 'Publish courses' },
                        { icon: <Wallet size={18} color="#00C2CB" />, label: 'Earn via UPI' },
                        { icon: <BadgeCheck size={18} color="#00C2CB" />, label: 'Tutor badge' },
                    ].map(p => (
                        <div key={p.label} style={{
                            background: 'rgba(255,255,255,0.02)', border: '1px solid #1f1f1f',
                            borderRadius: 10, padding: '14px 12px', textAlign: 'center',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                        }}>
                            {p.icon}
                            <span style={{ fontSize: 12, color: '#bbb', fontWeight: 500 }}>{p.label}</span>
                        </div>
                    ))}
                </div>

                {/* Form card */}
                <div style={{
                    background: '#111',
                    border: '1px solid #1e1e1e',
                    borderRadius: 18,
                    padding: 32,
                    boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

                        {/* Bio */}
                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#aaa', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                Bio
                            </label>
                            <textarea
                                required
                                rows={3}
                                placeholder="Tell students about yourself — your background, teaching style, and what makes you great..."
                                value={formData.bio}
                                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                style={inputBase}
                                onFocus={e => e.target.style.borderColor = '#00C2CB'}
                                onBlur={e => e.target.style.borderColor = '#2e2e2e'}
                            />
                        </div>

                        {/* Experience */}
                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#aaa', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                Subjects & Experience
                            </label>
                            <textarea
                                required
                                rows={3}
                                placeholder="E.g., 2 years tutoring Calculus, top 5% in Physics, scored 98 in Data Structures..."
                                value={formData.experience}
                                onChange={e => setFormData({ ...formData, experience: e.target.value })}
                                style={inputBase}
                                onFocus={e => e.target.style.borderColor = '#00C2CB'}
                                onBlur={e => e.target.style.borderColor = '#2e2e2e'}
                            />
                        </div>

                        {/* UPI */}
                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#aaa', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                UPI ID (for payouts)
                            </label>
                            <input
                                required
                                type="text"
                                placeholder="yourname@upi"
                                value={formData.upiId}
                                onChange={e => setFormData({ ...formData, upiId: e.target.value })}
                                style={inputBase}
                                onFocus={e => e.target.style.borderColor = '#00C2CB'}
                                onBlur={e => e.target.style.borderColor = '#2e2e2e'}
                            />
                            <p style={{ margin: '6px 0 0', fontSize: 11, color: '#555' }}>
                                Payouts are processed within 3 business days after each completed session.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                marginTop: 6,
                                width: '100%',
                                padding: '14px 0',
                                borderRadius: 10,
                                border: 'none',
                                background: loading ? '#0d3030' : '#00C2CB',
                                color: loading ? '#555' : '#0a0a0a',
                                fontSize: 14,
                                fontWeight: 700,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontFamily: 'inherit',
                                transition: 'background 0.15s',
                                letterSpacing: '0.02em',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            }}
                            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#00d6e0'; }}
                            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#00C2CB'; }}
                        >
                            <Zap size={16} />
                            {loading ? 'Upgrading Account…' : 'Upgrade to Tutor'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
