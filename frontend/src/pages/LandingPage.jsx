import { useEffect, useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import FluxLogo from '../components/FluxLogo';
import {
    Search, ChevronDown, ArrowRight, Zap,
    MonitorPlay, Code, PenTool, Database, Terminal, Layout,
    Video, Users, Star
} from 'lucide-react';

const T = {
    bg:     '#0f0f0f',
    card:   '#141414',
    border: '#1e1e1e',
    text:   '#f1f1f1',
    muted:  '#888',
    accent: '#00C2CB',
};

const CATEGORIES = [
    { name: 'Computer Science', icon: MonitorPlay, color: '#3ea6ff', bg: 'rgba(62,166,255,0.1)',   border: 'rgba(62,166,255,0.2)' },
    { name: 'Web Development',  icon: Code,        color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.2)' },
    { name: 'Design & UX',      icon: PenTool,     color: '#ec4899', bg: 'rgba(236,72,153,0.1)',   border: 'rgba(236,72,153,0.2)' },
    { name: 'Data Science',     icon: Database,    color: '#10b981', bg: 'rgba(16,185,129,0.1)',   border: 'rgba(16,185,129,0.2)' },
    { name: 'Software Eng',     icon: Terminal,    color: '#a78bfa', bg: 'rgba(167,139,250,0.1)',  border: 'rgba(167,139,250,0.2)' },
    { name: 'UI / Layouts',     icon: Layout,      color: '#00C2CB', bg: 'rgba(0,194,203,0.1)',    border: 'rgba(0,194,203,0.2)' },
];

const HOW = [
    { icon: <Star size={20} color="#00C2CB" />,    title: 'Browse Courses',      desc: 'Find peer-led courses across CS, design, data and more.' },
    { icon: <Users size={20} color="#3ea6ff" />,   title: 'Book a Slot',         desc: 'Pick a time that works for you and reserve your seat.' },
    { icon: <Video size={20} color="#a78bfa" />,   title: 'Join the Session',    desc: 'Connect live with your tutor via Google Meet or your preferred app.' },
];

export default function LandingPage() {
    const { user } = useContext(AuthContext);
    const navigate  = useNavigate();

    useEffect(() => {
        if (user) navigate(user.role === 'TUTOR' ? '/studio' : '/discover');
    }, [user, navigate]);

    if (user) return null;

    return (
        <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'Roboto, Inter, sans-serif', overflowX: 'hidden' }}>

            {/* ── NAVBAR ── */}
            <nav style={{
                position: 'sticky', top: 0, zIndex: 50,
                background: 'rgba(15,15,15,0.9)', backdropFilter: 'blur(14px)',
                borderBottom: `1px solid ${T.border}`,
                padding: '0 40px', height: 60,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                {/* Logo */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                    <FluxLogo size={28} fontSize={17} />
                </Link>

                {/* Single pair of auth buttons — only here */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Link to="/login" style={{
                        padding: '7px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                        color: '#aaa', textDecoration: 'none', border: `1px solid ${T.border}`,
                        transition: 'color 0.15s, border-color 0.15s',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.color = T.text; e.currentTarget.style.borderColor = '#444'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#aaa'; e.currentTarget.style.borderColor = T.border; }}
                    >
                        Log in
                    </Link>
                    <Link to="/register" style={{
                        padding: '7px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                        background: T.accent, color: '#0a0a0a', textDecoration: 'none',
                        transition: 'background 0.15s',
                    }}
                        onMouseEnter={e => e.currentTarget.style.background = '#00d6e0'}
                        onMouseLeave={e => e.currentTarget.style.background = T.accent}
                    >
                        Sign up
                    </Link>
                </div>
            </nav>

            {/* ── HERO ── */}
            <section style={{ position: 'relative', overflow: 'hidden' }}>
                {/* Subtle glow blobs */}
                <div style={{ position: 'absolute', top: -140, left: -140, width: 560, height: 560, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,194,203,0.09) 0%, transparent 65%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: 40, right: -100, width: 440, height: 440, borderRadius: '50%', background: 'radial-gradient(circle, rgba(62,166,255,0.06) 0%, transparent 65%)', pointerEvents: 'none' }} />
                {/* Grid texture */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)',
                    backgroundSize: '64px 64px', pointerEvents: 'none',
                }} />

                <div style={{
                    maxWidth: 900, margin: '0 auto', padding: '96px 32px 72px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                    gap: 20, position: 'relative', zIndex: 1,
                }}>
                    {/* Label */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 7,
                        background: 'rgba(0,194,203,0.08)', border: '1px solid rgba(0,194,203,0.25)',
                        borderRadius: 30, padding: '5px 14px',
                        fontSize: 11, fontWeight: 700, color: T.accent, letterSpacing: '0.08em', textTransform: 'uppercase',
                    }}>
                        <Zap size={12} /> Students teaching students
                    </div>

                    {/* Headline */}
                    <h1 style={{
                        fontSize: 'clamp(38px, 6vw, 68px)', fontWeight: 900,
                        lineHeight: 1.06, letterSpacing: '-2px', margin: 0,
                    }}>
                        Learn directly from{' '}
                        <span style={{
                            background: 'linear-gradient(90deg, #00C2CB, #3ea6ff)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                        }}>
                            your peers
                        </span>
                    </h1>

                    {/* Sub */}
                    <p style={{ fontSize: 17, color: T.muted, maxWidth: 520, lineHeight: 1.7, margin: 0 }}>
                        FLUX connects you with fellow students who can teach you exactly what you need — live, over a video call, on your schedule.
                    </p>

                    {/* Single CTA */}
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
                        <Link to="/register" style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            background: T.accent, color: '#0a0a0a',
                            padding: '13px 30px', borderRadius: 10, textDecoration: 'none',
                            fontSize: 14, fontWeight: 700, transition: 'background 0.15s',
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = '#00d6e0'}
                            onMouseLeave={e => e.currentTarget.style.background = T.accent}
                        >
                            Get Started Free <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section style={{ padding: '72px 32px', borderTop: `1px solid ${T.border}` }}>
                <div style={{ maxWidth: 900, margin: '0 auto' }}>
                    <h2 style={{ fontSize: 28, fontWeight: 800, color: T.text, textAlign: 'center', margin: '0 0 48px', letterSpacing: '-0.5px' }}>
                        How it works
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                        {HOW.map((step, i) => (
                            <div key={step.title} style={{
                                background: T.card, border: `1px solid ${T.border}`,
                                borderRadius: 16, padding: '28px 24px',
                                display: 'flex', flexDirection: 'column', gap: 14,
                                transition: 'border-color 0.2s',
                            }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = '#333'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{
                                        width: 42, height: 42, borderRadius: 12,
                                        background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0,
                                    }}>
                                        {step.icon}
                                    </div>
                                    <span style={{ fontSize: 11, color: '#444', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                        Step {i + 1}
                                    </span>
                                </div>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: T.text, margin: 0 }}>{step.title}</h3>
                                <p style={{ fontSize: 13, color: T.muted, margin: 0, lineHeight: 1.65 }}>{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CATEGORIES ── */}
            <section style={{ padding: '72px 32px', borderTop: `1px solid ${T.border}`, background: '#0a0a0a' }}>
                <div style={{ maxWidth: 900, margin: '0 auto' }}>
                    <h2 style={{ fontSize: 28, fontWeight: 800, color: T.text, textAlign: 'center', margin: '0 0 10px', letterSpacing: '-0.5px' }}>
                        Topics you can learn
                    </h2>
                    <p style={{ fontSize: 14, color: T.muted, textAlign: 'center', margin: '0 0 40px' }}>
                        Browse courses across these popular areas.
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                        {CATEGORIES.map(cat => (
                            <Link
                                to="/register"
                                key={cat.name}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    background: T.card, border: `1px solid ${T.border}`,
                                    borderRadius: 12, padding: '12px 18px',
                                    textDecoration: 'none', cursor: 'pointer',
                                    transition: 'border-color 0.2s, transform 0.2s',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.borderColor = cat.border;
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.borderColor = T.border;
                                }}
                            >
                                <div style={{
                                    width: 32, height: 32, borderRadius: 8,
                                    background: cat.bg, border: `1px solid ${cat.border}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                }}>
                                    <cat.icon size={16} color={cat.color} />
                                </div>
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#ccc' }}>{cat.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer style={{ borderTop: `1px solid ${T.border}`, padding: '20px 40px' }}>
                <div style={{
                    maxWidth: 900, margin: '0 auto',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <FluxLogo size={22} fontSize={13} color="#444" />
                        <span style={{ fontSize: 13, color: '#444', fontWeight: 600 }}>
                            © {new Date().getFullYear()}
                        </span>
                    </div>
                    <span style={{ fontSize: 12, color: '#333' }}>Connect · Learn · Grow</span>
                </div>
            </footer>
        </div>
    );
}
