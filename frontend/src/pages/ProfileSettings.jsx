import { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, User, Shield, Key, Laptop, Smartphone, Globe, Clock,
    Bell, CreditCard, AlertTriangle, LogOut, Trash2, Camera, Check,
    CheckCircle2, Lock, Download, ExternalLink, Eye, EyeOff, Sparkles,
    Save, ChevronRight, HelpCircle, RefreshCw, Send, DollarSign, Building
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api, { getErrorMessage } from '../services/api';
import { toast } from 'react-hot-toast';

const TIMEZONE_OPTIONS = [
    { value: 'Asia/Kolkata (IST, UTC+5:30)', label: 'Asia/Kolkata (IST, UTC+5:30) — Chennai, Mumbai, Delhi' },
    { value: 'America/New_York (EST, UTC-5:00)', label: 'America/New_York (EST, UTC-5:00) — New York, Toronto' },
    { value: 'America/Los_Angeles (PST, UTC-8:00)', label: 'America/Los_Angeles (PST, UTC-8:00) — San Francisco, LA' },
    { value: 'Europe/London (GMT, UTC+0:00)', label: 'Europe/London (GMT, UTC+0:00) — London, Dublin' },
    { value: 'Europe/Berlin (CET, UTC+1:00)', label: 'Europe/Berlin (CET, UTC+1:00) — Berlin, Paris, Amsterdam' },
    { value: 'Asia/Dubai (GST, UTC+4:00)', label: 'Asia/Dubai (GST, UTC+4:00) — Dubai, Abu Dhabi' },
    { value: 'Asia/Singapore (SGT, UTC+8:00)', label: 'Asia/Singapore (SGT, UTC+8:00) — Singapore, Hong Kong' },
    { value: 'Asia/Tokyo (JST, UTC+9:00)', label: 'Asia/Tokyo (JST, UTC+9:00) — Tokyo, Seoul' },
    { value: 'Australia/Sydney (AEST, UTC+10:00)', label: 'Australia/Sydney (AEST, UTC+10:00) — Sydney, Melbourne' },
];

const SECTIONS = [
    { id: 'profile', label: 'Profile Details', icon: User },
    { id: 'security', label: 'Account & Security', icon: Shield },
    { id: 'preferences', label: 'Scheduling & System', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'financials', label: 'Financials & Payouts', icon: CreditCard },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, danger: true },
];

export default function ProfileSettings() {
    const { user, login, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [activeSection, setActiveSection] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [savingSection, setSavingSection] = useState(false);

    // Profile & General Form State
    const [formData, setFormData] = useState({
        fullName: '',
        bio: '',
        fieldOfStudy: '',
        avatarUrl: '',
        portfolioUrl: '',
        repositoryUrl: '',
        timezone: 'Asia/Kolkata (IST, UTC+5:30)',
        timeFormat: '12h',
        emailNotifs60m: true,
        emailNotifsNewCourses: true,
        emailNotifsSecurity: true,
        payoutUpi: '',
        payoutBank: ''
    });

    // Password Form State
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    // Delete Account State
    const [deletePassword, setDeletePassword] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingAccount, setDeletingAccount] = useState(false);

    // Active Sessions (mocked realistic telemetry)
    const [sessions, setSessions] = useState([
        {
            id: 'sess-1',
            device: 'Windows 11 • Google Chrome 128',
            location: 'Chennai, Tamil Nadu, India',
            ip: '106.208.14.22',
            isCurrent: true,
            lastActive: 'Active now',
            icon: Laptop
        },
        {
            id: 'sess-2',
            device: 'macOS Sonoma • Safari 17.6',
            location: 'Bengaluru, Karnataka, India',
            ip: '49.207.210.85',
            isCurrent: false,
            lastActive: '2 hours ago',
            icon: Laptop
        },
        {
            id: 'sess-3',
            device: 'iOS 18.0 • Hive Mobile Web',
            location: 'Chennai, Tamil Nadu, India',
            ip: '106.208.14.22',
            isCurrent: false,
            lastActive: 'Yesterday at 09:42 PM',
            icon: Smartphone
        }
    ]);

    // Sample Transaction & Payout Statements
    const [transactions] = useState([
        { id: 'TXN-98421', date: '2026-09-10', item: 'Deep Dive: Distributed Systems & Raft', amount: '₹499.00', status: 'COMPLETED', type: 'Course Enrollment' },
        { id: 'TXN-98114', date: '2026-09-04', item: 'System Design: Kafka at Scale', amount: '₹799.00', status: 'COMPLETED', type: 'Course Enrollment' },
        { id: 'TXN-97802', date: '2026-08-28', item: 'Tutor Payout Statement (August Batch)', amount: '₹3,450.00', status: 'PAID OUT', type: 'Creator Payout' },
    ]);

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            try {
                const res = await api.get('/users/me');
                const data = res.data;
                setFormData({
                    fullName: data.name || data.fullName || '',
                    bio: data.bio || '',
                    fieldOfStudy: data.fieldOfStudy || '',
                    avatarUrl: data.avatarUrl || data.profileImage || '',
                    portfolioUrl: data.portfolioUrl || '',
                    repositoryUrl: data.repositoryUrl || '',
                    timezone: data.timezone || 'Asia/Kolkata (IST, UTC+5:30)',
                    timeFormat: data.timeFormat || '12h',
                    emailNotifs60m: data.emailNotifs60m ?? true,
                    emailNotifsNewCourses: data.emailNotifsNewCourses ?? true,
                    emailNotifsSecurity: data.emailNotifsSecurity ?? true,
                    payoutUpi: data.payoutUpi || '',
                    payoutBank: data.payoutBank || ''
                });
            } catch (err) {
                console.error("Failed to load user settings", err);
                if (user) {
                    setFormData(prev => ({
                        ...prev,
                        fullName: user.name || '',
                        bio: user.bio || '',
                        fieldOfStudy: user.fieldOfStudy || '',
                        avatarUrl: user.profileImage || user.avatarUrl || ''
                    }));
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [user]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append("file", file);

        setSavingSection(true);
        try {
            const res = await api.post('/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const newUrl = res.data.url;
            setFormData(prev => ({ ...prev, avatarUrl: newUrl }));

            // Save immediately to profile
            await api.put('/users/me', { ...formData, avatarUrl: newUrl });
            if (login) {
                login({ ...user, profileImage: newUrl, avatarUrl: newUrl }, localStorage.getItem('token'));
            }
            toast.success("Avatar uploaded and updated!");
        } catch (error) {
            console.error("Upload failed", error);
            toast.error(getErrorMessage(error, "Failed to upload image file."));
        } finally {
            setSavingSection(false);
        }
    };

    const handleSaveGeneral = async (e) => {
        if (e) e.preventDefault();
        setSavingSection(true);
        try {
            const res = await api.put('/users/me', formData);
            if (login) {
                login(res.data, localStorage.getItem('token'));
            }
            toast.success("Settings saved successfully!");
        } catch (error) {
            console.error("Failed to save settings", error);
            toast.error(getErrorMessage(error, "Failed to update settings."));
        } finally {
            setSavingSection(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error("New password and confirmation do not match.");
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            toast.error("New password must be at least 6 characters.");
            return;
        }

        setChangingPassword(true);
        try {
            await api.post('/users/change-password', passwordForm);
            toast.success("Password updated successfully!");
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(getErrorMessage(error, "Failed to change password."));
        } finally {
            setChangingPassword(false);
        }
    };

    const handleLogoutAllDevices = () => {
        if (!window.confirm("Are you sure you want to log out of all active devices? You will be redirected to the login page.")) return;
        setSessions(prev => prev.filter(s => s.isCurrent));
        toast.success("All other sessions terminated.");
        setTimeout(() => {
            if (logout) logout();
            navigate('/login');
        }, 1200);
    };

    const handleDownloadReceipt = (txn) => {
        const receiptText = `=====================================================
HIVE PEERTUTOR OFFICIAL TRANSACTION RECEIPT
=====================================================
Transaction ID : ${txn.id}
Date           : ${txn.date}
Type           : ${txn.type}
Description    : ${txn.item}
Amount         : ${txn.amount}
Status         : ${txn.status}
Account Name   : ${formData.fullName || user?.name}
Account Email  : ${user?.email}
=====================================================
Thank you for using Hive PeerTutor Interactive Learning!
Support: help@peertutor.io
=====================================================`;

        const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Hive_Receipt_${txn.id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success(`Downloaded receipt for ${txn.id}`);
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            toast.error("Please enter your current password to confirm account deletion.");
            return;
        }

        setDeletingAccount(true);
        try {
            await api.delete('/users/me', { data: { password: deletePassword } });
            toast.success("Account successfully deleted.");
            if (logout) logout();
            navigate('/register');
        } catch (error) {
            toast.error(getErrorMessage(error, "Failed to delete account. Incorrect password."));
        } finally {
            setDeletingAccount(false);
            setShowDeleteModal(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0a0a0a',
            color: '#f1f1f1',
            fontFamily: 'Roboto, Inter, -apple-system, sans-serif',
            padding: '24px 28px 80px',
        }}>
            {/* Top Navigation Row */}
            <div style={{ maxWidth: 1180, margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        background: '#161616', border: '1px solid #282828',
                        color: '#aaaaaa', padding: '8px 16px', borderRadius: 10,
                        fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#00C2CB'; e.currentTarget.style.borderColor = '#00C2CB44'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#aaaaaa'; e.currentTarget.style.borderColor = '#282828'; }}
                >
                    <ArrowLeft size={16} />
                    <span>Back to Dashboard</span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button
                        onClick={() => handleSaveGeneral()}
                        disabled={savingSection}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            background: '#00C2CB', color: '#0f0f0f',
                            border: 'none', padding: '8px 18px', borderRadius: 10,
                            fontSize: 13, fontWeight: 700, cursor: savingSection ? 'not-allowed' : 'pointer',
                            boxShadow: '0 0 16px rgba(0, 194, 203, 0.25)',
                            opacity: savingSection ? 0.7 : 1, transition: 'all 0.15s ease'
                        }}
                    >
                        <Save size={15} />
                        <span>{savingSection ? 'Saving...' : 'Save All Changes'}</span>
                    </button>
                </div>
            </div>

            {/* Main Settings Header */}
            <div style={{ maxWidth: 1180, margin: '0 auto 32px' }}>
                <h1 style={{
                    fontSize: 28, fontWeight: 800, margin: '0 0 6px',
                    letterSpacing: '-0.5px', color: '#ffffff',
                    display: 'flex', alignItems: 'center', gap: 10
                }}>
                    <span>Settings & Preferences</span>
                    <Sparkles size={22} color="#00C2CB" />
                </h1>
                <p style={{ margin: 0, fontSize: 14, color: '#888888', maxWidth: 640 }}>
                    Manage your public profile identity, security credentials, active sessions, time translation settings, and financial payout gateways.
                </p>
            </div>

            {/* Layout Grid: Sidebar Tabs + Content Area */}
            <div style={{
                maxWidth: 1180, margin: '0 auto',
                display: 'grid', gridTemplateColumns: '260px 1fr', gap: 28,
                alignItems: 'start'
            }}>
                {/* ── Left Navigation Sidebar ── */}
                <div style={{
                    background: '#121212',
                    border: '1px solid #222222',
                    borderRadius: 16,
                    padding: '12px 10px',
                    display: 'flex', flexDirection: 'column', gap: 4,
                    position: 'sticky', top: 24
                }}>
                    <span style={{ fontSize: 11, color: '#666666', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '8px 12px 6px' }}>
                        System Modules
                    </span>
                    {SECTIONS.map(sec => {
                        const Icon = sec.icon;
                        const isSelected = activeSection === sec.id;
                        return (
                            <button
                                key={sec.id}
                                onClick={() => setActiveSection(sec.id)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    padding: '11px 14px', borderRadius: 10,
                                    fontSize: 13, fontWeight: isSelected ? 700 : 500,
                                    border: 'none', cursor: 'pointer', textAlign: 'left',
                                    transition: 'all 0.15s ease',
                                    background: isSelected
                                        ? (sec.danger ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0, 194, 203, 0.12)')
                                        : 'transparent',
                                    color: isSelected
                                        ? (sec.danger ? '#ff5555' : '#00C2CB')
                                        : (sec.danger ? '#cc5555' : '#aaaaaa'),
                                    boxShadow: isSelected && !sec.danger
                                        ? 'inset 0 0 0 1px rgba(0, 194, 203, 0.3)'
                                        : isSelected && sec.danger
                                        ? 'inset 0 0 0 1px rgba(239, 68, 68, 0.3)'
                                        : 'none',
                                }}
                                onMouseEnter={e => {
                                    if (!isSelected) {
                                        e.currentTarget.style.background = '#181818';
                                        e.currentTarget.style.color = sec.danger ? '#ff6666' : '#f1f1f1';
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (!isSelected) {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = sec.danger ? '#cc5555' : '#aaaaaa';
                                    }
                                }}
                            >
                                <Icon size={16} />
                                <span style={{ flex: 1 }}>{sec.label}</span>
                                {isSelected && <ChevronRight size={14} />}
                            </button>
                        );
                    })}

                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #1f1f1f', paddingLeft: 12, paddingRight: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80' }} />
                            <span style={{ fontSize: 11, color: '#888888' }}>Backend Sync: <strong style={{ color: '#4ade80' }}>Active</strong></span>
                        </div>
                    </div>
                </div>

                {/* ── Main Content Column ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                    {/* ══════════════════════════════════════════════════════════
                        SECTION 1: PROFILE INFORMATION
                       ══════════════════════════════════════════════════════════ */}
                    {(activeSection === 'profile' || activeSection === 'all') && (
                        <div style={{
                            background: '#141414',
                            border: '1px solid #262626',
                            borderRadius: 18,
                            padding: 28,
                            boxShadow: '0 12px 32px rgba(0,0,0,0.4)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid #222222', paddingBottom: 14 }}>
                                <div>
                                    <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#f1f1f1' }}>Profile Details</h2>
                                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#888888' }}>Your public presence across Hive Discover and Tutor channel pages.</p>
                                </div>
                                <span style={{ fontSize: 11, color: '#00C2CB', fontWeight: 600 }}>Public Visibility</span>
                            </div>

                            {/* Avatar Section with Interactive Upload */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{
                                        position: 'relative', width: 84, height: 84, borderRadius: '50%',
                                        overflow: 'hidden', cursor: 'pointer', background: '#222222',
                                        border: '2px solid #333333', flexShrink: 0,
                                        boxShadow: '0 4px 16px rgba(0,0,0,0.6)'
                                    }}
                                    title="Click to upload new avatar"
                                >
                                    {formData.avatarUrl ? (
                                        <img src={formData.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#00C2CB' }}>
                                            {formData.fullName?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                    <div style={{
                                        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                        opacity: 0, transition: 'opacity 0.2s ease', gap: 3
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                    onMouseLeave={e => e.currentTarget.style.opacity = 0}
                                    >
                                        <Camera size={20} color="#00C2CB" />
                                        <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', textTransform: 'uppercase' }}>Change</span>
                                    </div>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            style={{
                                                background: '#222222', border: '1px solid #383838',
                                                color: '#f1f1f1', padding: '7px 14px', borderRadius: 8,
                                                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                                transition: 'all 0.15s ease'
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.background = '#2c2c2c'; e.currentTarget.style.borderColor = '#00C2CB'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = '#222222'; e.currentTarget.style.borderColor = '#383838'; }}
                                        >
                                            <Camera size={14} color="#00C2CB" />
                                            <span>Upload Physical Image (JPG/PNG)</span>
                                        </button>
                                        {formData.avatarUrl && (
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, avatarUrl: '' }))}
                                                style={{ background: 'transparent', border: 'none', color: '#888888', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                    <p style={{ margin: 0, fontSize: 11, color: '#777777', lineHeight: 1.4 }}>
                                        Recommended format: Square 400x400px. Uploaded files are served securely via <code style={{ color: '#00C2CB', background: '#1c1c1c', padding: '1px 5px', borderRadius: 4 }}>/uploads/**</code>.
                                    </p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        style={{ display: 'none' }}
                                        onChange={handleFileUpload}
                                    />
                                </div>
                            </div>

                            {/* Form Fields */}
                            <form onSubmit={handleSaveGeneral} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 11, color: '#aaaaaa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.fullName}
                                            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                            placeholder="Your display name"
                                            required
                                            style={{
                                                width: '100%', background: '#101010', border: '1px solid #2d2d2d',
                                                borderRadius: 10, padding: '11px 14px', color: '#f1f1f1',
                                                fontSize: 13, outline: 'none', boxSizing: 'border-box',
                                                transition: 'border-color 0.15s'
                                            }}
                                            onFocus={e => e.target.style.borderColor = '#00C2CB'}
                                            onBlur={e => e.target.style.borderColor = '#2d2d2d'}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: 11, color: '#aaaaaa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                                            Field of Study / Headline
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.fieldOfStudy}
                                            onChange={e => setFormData({ ...formData, fieldOfStudy: e.target.value })}
                                            placeholder="e.g. Backend Engineering & Distributed Systems"
                                            style={{
                                                width: '100%', background: '#101010', border: '1px solid #2d2d2d',
                                                borderRadius: 10, padding: '11px 14px', color: '#f1f1f1',
                                                fontSize: 13, outline: 'none', boxSizing: 'border-box',
                                                transition: 'border-color 0.15s'
                                            }}
                                            onFocus={e => e.target.style.borderColor = '#00C2CB'}
                                            onBlur={e => e.target.style.borderColor = '#2d2d2d'}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                        <label style={{ fontSize: 11, color: '#aaaaaa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Bio & Teaching Philosophy
                                        </label>
                                        <span style={{ fontSize: 11, color: '#666666' }}>{formData.bio?.length || 0}/500</span>
                                    </div>
                                    <textarea
                                        rows={4}
                                        maxLength={500}
                                        value={formData.bio}
                                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                        placeholder="Share your technical interests, coding journey, and how you help fellow peers succeed..."
                                        style={{
                                            width: '100%', background: '#101010', border: '1px solid #2d2d2d',
                                            borderRadius: 10, padding: '12px 14px', color: '#f1f1f1',
                                            fontSize: 13, outline: 'none', boxSizing: 'border-box',
                                            resize: 'vertical', lineHeight: 1.5,
                                            transition: 'border-color 0.15s'
                                        }}
                                        onFocus={e => e.target.style.borderColor = '#00C2CB'}
                                        onBlur={e => e.target.style.borderColor = '#2d2d2d'}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 11, color: '#aaaaaa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                                            Portfolio / Website URL
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.portfolioUrl}
                                            onChange={e => setFormData({ ...formData, portfolioUrl: e.target.value })}
                                            placeholder="https://yourportfolio.dev"
                                            style={{
                                                width: '100%', background: '#101010', border: '1px solid #2d2d2d',
                                                borderRadius: 10, padding: '11px 14px', color: '#f1f1f1',
                                                fontSize: 13, outline: 'none', boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: 11, color: '#aaaaaa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                                            GitHub / Repository URL
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.repositoryUrl}
                                            onChange={e => setFormData({ ...formData, repositoryUrl: e.target.value })}
                                            placeholder="https://github.com/username"
                                            style={{
                                                width: '100%', background: '#101010', border: '1px solid #2d2d2d',
                                                borderRadius: 10, padding: '11px 14px', color: '#f1f1f1',
                                                fontSize: 13, outline: 'none', boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
                                    <button
                                        type="submit"
                                        disabled={savingSection}
                                        style={{
                                            background: '#00C2CB', color: '#0f0f0f',
                                            border: 'none', padding: '10px 22px', borderRadius: 10,
                                            fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                            display: 'inline-flex', alignItems: 'center', gap: 6,
                                        }}
                                    >
                                        <Save size={15} />
                                        <span>{savingSection ? 'Saving Profile...' : 'Save Profile Changes'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* ══════════════════════════════════════════════════════════
                        SECTION 2: ACCOUNT & SECURITY
                       ══════════════════════════════════════════════════════════ */}
                    {(activeSection === 'security' || activeSection === 'all') && (
                        <div style={{
                            background: '#141414',
                            border: '1px solid #262626',
                            borderRadius: 18,
                            padding: 28,
                            boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
                            display: 'flex', flexDirection: 'column', gap: 28
                        }}>
                            {/* Header */}
                            <div style={{ borderBottom: '1px solid #222222', paddingBottom: 14 }}>
                                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#f1f1f1' }}>Account & Security</h2>
                                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#888888' }}>Manage your login credentials, email verification, and active signed-in devices.</p>
                            </div>

                            {/* Registered Email */}
                            <div style={{ background: '#101010', border: '1px solid #242424', borderRadius: 12, padding: 18 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <label style={{ fontSize: 12, color: '#f1f1f1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Primary Registered Email
                                        </label>
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: 4,
                                            background: 'rgba(74, 222, 128, 0.12)', color: '#4ade80',
                                            border: '1px solid rgba(74, 222, 128, 0.25)', borderRadius: 12,
                                            padding: '2px 8px', fontSize: 11, fontWeight: 700
                                        }}>
                                            <CheckCircle2 size={12} /> Verified
                                        </span>
                                    </div>
                                    <span style={{ fontSize: 11, color: '#888888' }}>Managed by Hive Auth</span>
                                </div>

                                <div style={{ display: 'flex', gap: 10 }}>
                                    <input
                                        type="email"
                                        disabled
                                        value={user?.email || ''}
                                        style={{
                                            flex: 1, background: '#161616', border: '1px solid #2c2c2c',
                                            borderRadius: 8, padding: '10px 14px', color: '#888888',
                                            fontSize: 13, cursor: 'not-allowed'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => toast.success("Verification link sent to " + user?.email)}
                                        style={{
                                            background: '#222222', border: '1px solid #333333',
                                            color: '#f1f1f1', padding: '10px 16px', borderRadius: 8,
                                            fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                            display: 'inline-flex', alignItems: 'center', gap: 6
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.borderColor = '#00C2CB'}
                                        onMouseLeave={e => e.currentTarget.style.borderColor = '#333333'}
                                    >
                                        <Send size={13} color="#00C2CB" />
                                        <span>Send Verification Link</span>
                                    </button>
                                </div>
                            </div>

                            {/* Change Password Form */}
                            <div style={{ background: '#101010', border: '1px solid #242424', borderRadius: 12, padding: 18 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                    <Key size={16} color="#00C2CB" />
                                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#f1f1f1' }}>Change Password</h3>
                                </div>

                                <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    <div style={{ position: 'relative' }}>
                                        <label style={{ display: 'block', fontSize: 11, color: '#aaaaaa', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase' }}>
                                            Current Password
                                        </label>
                                        <input
                                            type={showCurrentPassword ? "text" : "password"}
                                            required
                                            value={passwordForm.currentPassword}
                                            onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                            placeholder="Enter your current password"
                                            style={{
                                                width: '100%', background: '#161616', border: '1px solid #2d2d2d',
                                                borderRadius: 8, padding: '10px 40px 10px 14px', color: '#f1f1f1',
                                                fontSize: 13, outline: 'none', boxSizing: 'border-box'
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            style={{ position: 'absolute', right: 12, top: 29, background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}
                                        >
                                            {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                        <div style={{ position: 'relative' }}>
                                            <label style={{ display: 'block', fontSize: 11, color: '#aaaaaa', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase' }}>
                                                New Password
                                            </label>
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                required
                                                value={passwordForm.newPassword}
                                                onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                                placeholder="Min. 6 characters"
                                                style={{
                                                    width: '100%', background: '#161616', border: '1px solid #2d2d2d',
                                                    borderRadius: 8, padding: '10px 40px 10px 14px', color: '#f1f1f1',
                                                    fontSize: 13, outline: 'none', boxSizing: 'border-box'
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                style={{ position: 'absolute', right: 12, top: 29, background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}
                                            >
                                                {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                            </button>
                                        </div>

                                        <div style={{ position: 'relative' }}>
                                            <label style={{ display: 'block', fontSize: 11, color: '#aaaaaa', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase' }}>
                                                Confirm New Password
                                            </label>
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                required
                                                value={passwordForm.confirmPassword}
                                                onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                                placeholder="Repeat new password"
                                                style={{
                                                    width: '100%', background: '#161616', border: '1px solid #2d2d2d',
                                                    borderRadius: 8, padding: '10px 40px 10px 14px', color: '#f1f1f1',
                                                    fontSize: 13, outline: 'none', boxSizing: 'border-box'
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                style={{ position: 'absolute', right: 12, top: 29, background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}
                                            >
                                                {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                                        <button
                                            type="submit"
                                            disabled={changingPassword}
                                            style={{
                                                background: '#242424', border: '1px solid #383838',
                                                color: '#00C2CB', padding: '9px 18px', borderRadius: 8,
                                                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                                display: 'inline-flex', alignItems: 'center', gap: 6
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#2c2c2c'}
                                            onMouseLeave={e => e.currentTarget.style.background = '#242424'}
                                        >
                                            <Key size={14} />
                                            <span>{changingPassword ? 'Updating...' : 'Update Password'}</span>
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Active Sessions */}
                            <div style={{ background: '#101010', border: '1px solid #242424', borderRadius: 12, padding: 18 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Laptop size={16} color="#00C2CB" />
                                        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#f1f1f1' }}>Active Devices & Sessions</h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleLogoutAllDevices}
                                        style={{
                                            background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)',
                                            color: '#ff5555', padding: '6px 12px', borderRadius: 8,
                                            fontSize: 12, fontWeight: 700, cursor: 'pointer',
                                            display: 'inline-flex', alignItems: 'center', gap: 6
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)'}
                                    >
                                        <LogOut size={13} />
                                        <span>Log Out of All Devices</span>
                                    </button>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {sessions.map(sess => {
                                        const DevIcon = sess.icon;
                                        return (
                                            <div
                                                key={sess.id}
                                                style={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                    padding: '12px 16px', background: sess.isCurrent ? 'rgba(0, 194, 203, 0.04)' : '#161616',
                                                    border: sess.isCurrent ? '1px solid rgba(0, 194, 203, 0.25)' : '1px solid #282828',
                                                    borderRadius: 10
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <div style={{
                                                        width: 36, height: 36, borderRadius: 8,
                                                        background: sess.isCurrent ? 'rgba(0, 194, 203, 0.15)' : '#202020',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        color: sess.isCurrent ? '#00C2CB' : '#888'
                                                    }}>
                                                        <DevIcon size={18} />
                                                    </div>
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            <span style={{ fontSize: 13, fontWeight: 600, color: '#f1f1f1' }}>{sess.device}</span>
                                                            {sess.isCurrent && (
                                                                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: '#00C2CB', color: '#0f0f0f' }}>
                                                                    THIS DEVICE
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span style={{ fontSize: 11, color: '#777777' }}>
                                                            {sess.location} • IP: {sess.ip} • <strong style={{ color: sess.isCurrent ? '#4ade80' : '#888' }}>{sess.lastActive}</strong>
                                                        </span>
                                                    </div>
                                                </div>

                                                {!sess.isCurrent && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSessions(sessions.filter(s => s.id !== sess.id));
                                                            toast.success(`Revoked session on ${sess.device}`);
                                                        }}
                                                        style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: 12 }}
                                                        onMouseEnter={e => e.currentTarget.style.color = '#ff5555'}
                                                        onMouseLeave={e => e.currentTarget.style.color = '#888'}
                                                    >
                                                        Revoke
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ══════════════════════════════════════════════════════════
                        SECTION 3: SCHEDULING & SYSTEM PREFERENCES
                       ══════════════════════════════════════════════════════════ */}
                    {(activeSection === 'preferences' || activeSection === 'all') && (
                        <div style={{
                            background: '#141414',
                            border: '1px solid #262626',
                            borderRadius: 18,
                            padding: 28,
                            boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
                            display: 'flex', flexDirection: 'column', gap: 24
                        }}>
                            <div style={{ borderBottom: '1px solid #222222', paddingBottom: 14 }}>
                                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#f1f1f1' }}>Scheduling & System Preferences</h2>
                                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#888888' }}>Configure timezone translation and clock display styles for peer tutoring slot calculations.</p>
                            </div>

                            {/* Timezone Selector */}
                            <div>
                                <label style={{ display: 'block', fontSize: 11, color: '#aaaaaa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                                    Primary Local Timezone
                                </label>
                                <p style={{ margin: '0 0 8px', fontSize: 12, color: '#777777' }}>
                                    All course slots and live session timers will be calibrated to this local standard.
                                </p>
                                <select
                                    value={formData.timezone}
                                    onChange={e => {
                                        setFormData({ ...formData, timezone: e.target.value });
                                        toast.success(`Timezone updated to ${e.target.value.split(' ')[0]}`);
                                    }}
                                    style={{
                                        width: '100%', background: '#101010', border: '1px solid #2d2d2d',
                                        borderRadius: 10, padding: '12px 14px', color: '#00C2CB',
                                        fontSize: 13, fontWeight: 600, outline: 'none', cursor: 'pointer',
                                        boxSizing: 'border-box'
                                    }}
                                >
                                    {TIMEZONE_OPTIONS.map(tz => (
                                        <option key={tz.value} value={tz.value} style={{ background: '#181818', color: '#f1f1f1' }}>
                                            {tz.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Date/Time Format Toggle */}
                            <div style={{ borderTop: '1px solid #222222', paddingTop: 20 }}>
                                <label style={{ display: 'block', fontSize: 11, color: '#aaaaaa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                                    Time Display Format
                                </label>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, timeFormat: '12h' })}
                                        style={{
                                            flex: 1, padding: '14px 16px', borderRadius: 10,
                                            background: formData.timeFormat === '12h' ? 'rgba(0, 194, 203, 0.12)' : '#101010',
                                            border: formData.timeFormat === '12h' ? '1.5px solid #00C2CB' : '1px solid #282828',
                                            color: formData.timeFormat === '12h' ? '#00C2CB' : '#aaaaaa',
                                            cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 4
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: 13, fontWeight: 700 }}>12-Hour Clock (AM/PM)</span>
                                            {formData.timeFormat === '12h' && <Check size={16} />}
                                        </div>
                                        <span style={{ fontSize: 11, color: '#666' }}>Example: 09:30 AM – 11:00 AM</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, timeFormat: '24h' })}
                                        style={{
                                            flex: 1, padding: '14px 16px', borderRadius: 10,
                                            background: formData.timeFormat === '24h' ? 'rgba(0, 194, 203, 0.12)' : '#101010',
                                            border: formData.timeFormat === '24h' ? '1.5px solid #00C2CB' : '1px solid #282828',
                                            color: formData.timeFormat === '24h' ? '#00C2CB' : '#aaaaaa',
                                            cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 4
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: 13, fontWeight: 700 }}>24-Hour Military Format</span>
                                            {formData.timeFormat === '24h' && <Check size={16} />}
                                        </div>
                                        <span style={{ fontSize: 11, color: '#666' }}>Example: 09:30 – 11:00 / 21:30</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ══════════════════════════════════════════════════════════
                        SECTION 4: NOTIFICATION PREFERENCES
                       ══════════════════════════════════════════════════════════ */}
                    {(activeSection === 'notifications' || activeSection === 'all') && (
                        <div style={{
                            background: '#141414',
                            border: '1px solid #262626',
                            borderRadius: 18,
                            padding: 28,
                            boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
                            display: 'flex', flexDirection: 'column', gap: 20
                        }}>
                            <div style={{ borderBottom: '1px solid #222222', paddingBottom: 14 }}>
                                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#f1f1f1' }}>Email & Alert Notifications</h2>
                                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#888888' }}>Control transactional emails, reminders, and creator broadcast announcements.</p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {/* 60-Minute Reminders — Mandatory */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '16px 18px', background: '#101010', border: '1px solid #282828',
                                    borderRadius: 12
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                                        <Clock size={20} color="#facc15" style={{ marginTop: 2 }} />
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{ fontSize: 14, fontWeight: 600, color: '#f1f1f1' }}>60-Minute Class Reminders</span>
                                                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(250,204,21,0.15)', color: '#facc15' }}>
                                                    REQUIRED
                                                </span>
                                            </div>
                                            <p style={{ margin: '3px 0 0', fontSize: 12, color: '#777777' }}>
                                                Automated in-app and SendGrid HTML reminder sent 1 hour prior to your scheduled sessions.
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{
                                        width: 44, height: 24, borderRadius: 12, background: '#00C2CB',
                                        display: 'flex', alignItems: 'center', padding: '2px', cursor: 'not-allowed',
                                        opacity: 0.85
                                    }} title="Mandatory for live class coordination">
                                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#0f0f0f', transform: 'translateX(20px)' }} />
                                    </div>
                                </div>

                                {/* New Course Announcements */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '16px 18px', background: '#101010', border: '1px solid #282828',
                                    borderRadius: 12
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                                        <Sparkles size={20} color="#00C2CB" style={{ marginTop: 2 }} />
                                        <div>
                                            <span style={{ fontSize: 14, fontWeight: 600, color: '#f1f1f1' }}>New Course Announcements</span>
                                            <p style={{ margin: '3px 0 0', fontSize: 12, color: '#777777' }}>
                                                Receive instant notifications whenever tutors you subscribe to release new cohorts or slots.
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, emailNotifsNewCourses: !formData.emailNotifsNewCourses })}
                                        style={{
                                            width: 44, height: 24, borderRadius: 12,
                                            background: formData.emailNotifsNewCourses ? '#00C2CB' : '#222222',
                                            border: 'none', display: 'flex', alignItems: 'center', padding: '2px',
                                            cursor: 'pointer', transition: 'background 0.2s'
                                        }}
                                    >
                                        <div style={{
                                            width: 20, height: 20, borderRadius: '50%', background: '#fff',
                                            transform: formData.emailNotifsNewCourses ? 'translateX(20px)' : 'translateX(0px)',
                                            transition: 'transform 0.2s'
                                        }} />
                                    </button>
                                </div>

                                {/* Account Security Alerts */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '16px 18px', background: '#101010', border: '1px solid #282828',
                                    borderRadius: 12
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                                        <Shield size={20} color="#4ade80" style={{ marginTop: 2 }} />
                                        <div>
                                            <span style={{ fontSize: 14, fontWeight: 600, color: '#f1f1f1' }}>Account Security & Login Alerts</span>
                                            <p style={{ margin: '3px 0 0', fontSize: 12, color: '#777777' }}>
                                                Email alerts when your account is accessed from an unrecognized browser or IP.
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, emailNotifsSecurity: !formData.emailNotifsSecurity })}
                                        style={{
                                            width: 44, height: 24, borderRadius: 12,
                                            background: formData.emailNotifsSecurity ? '#00C2CB' : '#222222',
                                            border: 'none', display: 'flex', alignItems: 'center', padding: '2px',
                                            cursor: 'pointer', transition: 'background 0.2s'
                                        }}
                                    >
                                        <div style={{
                                            width: 20, height: 20, borderRadius: '50%', background: '#fff',
                                            transform: formData.emailNotifsSecurity ? 'translateX(20px)' : 'translateX(0px)',
                                            transition: 'transform 0.2s'
                                        }} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ══════════════════════════════════════════════════════════
                        SECTION 5: FINANCIALS & PAYOUTS (TUTOR SPECIFIC)
                       ══════════════════════════════════════════════════════════ */}
                    {(activeSection === 'financials' || activeSection === 'all') && (
                        <div style={{
                            background: '#141414',
                            border: '1px solid #262626',
                            borderRadius: 18,
                            padding: 28,
                            boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
                            display: 'flex', flexDirection: 'column', gap: 24
                        }}>
                            <div style={{ borderBottom: '1px solid #222222', paddingBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#f1f1f1' }}>Financials & Creator Payouts</h2>
                                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#888888' }}>Direct UPI ID routing and bank deposit channels for course earnings.</p>
                                </div>
                                <span style={{
                                    fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                                    background: 'rgba(0, 194, 203, 0.15)', color: '#00C2CB'
                                }}>
                                    CREATOR GATEWAY
                                </span>
                            </div>

                            {/* Payout Input Details */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 11, color: '#aaaaaa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                                        UPI ID (Fast Payouts)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.payoutUpi}
                                        onChange={e => setFormData({ ...formData, payoutUpi: e.target.value })}
                                        placeholder="e.g. sabarish@okhdfcbank or user@upi"
                                        style={{
                                            width: '100%', background: '#101010', border: '1px solid #2d2d2d',
                                            borderRadius: 10, padding: '11px 14px', color: '#f1f1f1',
                                            fontSize: 13, outline: 'none', boxSizing: 'border-box'
                                        }}
                                    />
                                    <span style={{ fontSize: 10, color: '#666', marginTop: 4, display: 'block' }}>Direct instant settlement to your UPI-linked bank.</span>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: 11, color: '#aaaaaa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                                        Bank Account Details / Routing (IFSC)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.payoutBank}
                                        onChange={e => setFormData({ ...formData, payoutBank: e.target.value })}
                                        placeholder="A/C: 501004928192 • IFSC: HDFC0001234"
                                        style={{
                                            width: '100%', background: '#101010', border: '1px solid #2d2d2d',
                                            borderRadius: 10, padding: '11px 14px', color: '#f1f1f1',
                                            fontSize: 13, outline: 'none', boxSizing: 'border-box'
                                        }}
                                    />
                                    <span style={{ fontSize: 10, color: '#666', marginTop: 4, display: 'block' }}>NEFT/RTGS backup destination for monthly disbursements.</span>
                                </div>
                            </div>

                            {/* Statements & History */}
                            <div style={{ borderTop: '1px solid #222222', paddingTop: 16 }}>
                                <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px', color: '#f1f1f1' }}>
                                    Recent Statements & Enrollment Receipts
                                </h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {transactions.map(txn => (
                                        <div
                                            key={txn.id}
                                            style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                padding: '12px 16px', background: '#101010', border: '1px solid #242424',
                                                borderRadius: 10
                                            }}
                                        >
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <span style={{ fontSize: 13, fontWeight: 600, color: '#f1f1f1' }}>{txn.item}</span>
                                                    <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80' }}>
                                                        {txn.status}
                                                    </span>
                                                </div>
                                                <span style={{ fontSize: 11, color: '#777777' }}>
                                                    Ref: {txn.id} • Date: {txn.date} • Type: {txn.type}
                                                </span>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                                <span style={{ fontSize: 13, fontWeight: 700, color: '#00C2CB' }}>{txn.amount}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDownloadReceipt(txn)}
                                                    style={{
                                                        background: '#1a1a1a', border: '1px solid #333',
                                                        color: '#f1f1f1', padding: '6px 12px', borderRadius: 6,
                                                        fontSize: 11, fontWeight: 600, cursor: 'pointer',
                                                        display: 'inline-flex', alignItems: 'center', gap: 4
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.borderColor = '#00C2CB'}
                                                    onMouseLeave={e => e.currentTarget.style.borderColor = '#333'}
                                                >
                                                    <Download size={12} />
                                                    <span>Receipt</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ══════════════════════════════════════════════════════════
                        SECTION 6: DANGER ZONE
                       ══════════════════════════════════════════════════════════ */}
                    {(activeSection === 'danger' || activeSection === 'all') && (
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.03)',
                            border: '1px solid rgba(239, 68, 68, 0.35)',
                            borderRadius: 18,
                            padding: 28,
                            boxShadow: '0 12px 32px rgba(239, 68, 68, 0.05)',
                            display: 'flex', flexDirection: 'column', gap: 16
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <AlertTriangle size={20} color="#ef4444" />
                                <div>
                                    <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#ff5555' }}>Danger Zone</h2>
                                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#cc8888' }}>
                                        Irreversible destructive actions. Once an account is deleted, all enrolled courses and reviews cannot be recovered.
                                    </p>
                                </div>
                            </div>

                            <div style={{
                                background: '#120a0a', border: '1px solid rgba(239, 68, 68, 0.25)',
                                borderRadius: 12, padding: 18, display: 'flex', justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <span style={{ fontSize: 14, fontWeight: 700, color: '#f1f1f1', display: 'block' }}>
                                        Permanently Delete Account
                                    </span>
                                    <span style={{ fontSize: 12, color: '#888' }}>
                                        Wipe all your profile information, course records, and session history permanently.
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setShowDeleteModal(true)}
                                    style={{
                                        background: '#ef4444', color: '#ffffff',
                                        border: 'none', padding: '9px 18px', borderRadius: 8,
                                        fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                        display: 'inline-flex', alignItems: 'center', gap: 6,
                                        boxShadow: '0 0 16px rgba(239, 68, 68, 0.3)'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#dc2626'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#ef4444'}
                                >
                                    <Trash2 size={14} />
                                    <span>Delete Account</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── High-Friction Delete Account Confirmation Modal ── */}
            {showDeleteModal && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
                }}>
                    <div style={{
                        background: '#161616', border: '1px solid rgba(239, 68, 68, 0.5)',
                        borderRadius: 18, padding: 28, maxWidth: 460, width: '100%',
                        boxShadow: '0 24px 64px rgba(0,0,0,0.9)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                            <AlertTriangle size={22} color="#ef4444" />
                            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#ff5555' }}>
                                Confirm Account Deletion
                            </h3>
                        </div>

                        <p style={{ margin: '0 0 18px', fontSize: 13, color: '#cccccc', lineHeight: 1.5 }}>
                            This action is <strong>permanent</strong> and cannot be undone. To prevent accidental deletions, please type your current account password below:
                        </p>

                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', fontSize: 11, color: '#aaaaaa', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase' }}>
                                Current Password
                            </label>
                            <input
                                type="password"
                                value={deletePassword}
                                onChange={e => setDeletePassword(e.target.value)}
                                placeholder="Enter password to confirm"
                                style={{
                                    width: '100%', background: '#101010', border: '1px solid #383838',
                                    borderRadius: 8, padding: '11px 14px', color: '#f1f1f1',
                                    fontSize: 13, outline: 'none', boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: 10 }}>
                            <button
                                type="button"
                                onClick={() => { setShowDeleteModal(false); setDeletePassword(''); }}
                                style={{
                                    flex: 1, background: '#242424', border: '1px solid #3a3a3a',
                                    color: '#aaaaaa', padding: '10px 16px', borderRadius: 10,
                                    fontSize: 13, fontWeight: 600, cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={deletingAccount || !deletePassword}
                                onClick={handleDeleteAccount}
                                style={{
                                    flex: 1, background: '#ef4444', border: 'none',
                                    color: '#ffffff', padding: '10px 16px', borderRadius: 10,
                                    fontSize: 13, fontWeight: 700, cursor: (!deletePassword || deletingAccount) ? 'not-allowed' : 'pointer',
                                    opacity: (!deletePassword || deletingAccount) ? 0.5 : 1
                                }}
                            >
                                {deletingAccount ? 'Deleting...' : 'Permanently Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
