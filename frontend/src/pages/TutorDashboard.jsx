import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { 
    Plus, X, Edit2, ChevronDown, Trash2, Upload, PlayCircle, 
    Users, Eye, Sparkles, BookOpen, Star, Video, Check, ExternalLink,
    Clock, Calendar, UserCheck
} from 'lucide-react';

export default function TutorDashboard() {
    const { user, login } = useContext(AuthContext);

    const CS_CATEGORIES = [
        "Software Development", "Databases", "Cloud & DevOps", 
        "Cybersecurity", "Networking", "AI & Machine Learning", 
        "Data Science", "Hardware & Systems"
    ];

    const [activeTab, setActiveTab] = useState('courses'); // 'courses' | 'subscribers' | 'profile'
    const [profileData, setProfileData] = useState(null);
    const [myCourses, setMyCourses] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [slots, setSlots] = useState([{ date: '', startTime: '', endTime: '' }]);

    const [selectedCourseRoster, setSelectedCourseRoster] = useState(null);
    const [rosterData, setRosterData] = useState([]);
    const [loadingRoster, setLoadingRoster] = useState(false);

    // Profile edit state
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({ name: '', fieldOfStudy: '', bio: '', avatarUrl: '' });
    const [savingProfile, setSavingProfile] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        maxPeers: 5,
        thumbnailUrl: '',
        demoVideoUrl: '',
        meetLink: '',
        categoryName: ''
    });

    const fetchStudioData = async () => {
        try {
            const [coursesRes, userRes] = await Promise.all([
                api.get(`/courses/user/${user.id}`),
                api.get(`/users/public/${user.id}`).catch(() => ({ data: null }))
            ]);

            setMyCourses(Array.isArray(coursesRes.data) ? coursesRes.data : []);
            if (userRes?.data) {
                setProfileData(userRes.data);
                setProfileForm({
                    name: userRes.data.name || user?.name || '',
                    fieldOfStudy: userRes.data.fieldOfStudy || '',
                    bio: userRes.data.bio || '',
                    avatarUrl: userRes.data.avatarUrl || user?.profileImage || ''
                });
            }
        } catch (error) {
            console.error("Failed to load studio data", error);
        }
    };

    useEffect(() => {
        if (user?.id) {
            fetchStudioData();
        }
    }, [user]);

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        try {
            const formattedSlots = slots
                .filter(s => s.date && s.startTime && s.endTime)
                .map(s => ({
                    startTime: `${s.date}T${s.startTime}:00`,
                    endTime: `${s.date}T${s.endTime}:00`,
                    maxSeats: parseInt(formData.maxPeers)
                }));

            if (formattedSlots.length === 0) {
                toast.error('Please add at least one valid slot with start and end times.');
                return;
            }

            // Validate end > start
            const invalid = formattedSlots.find(s => new Date(s.endTime) <= new Date(s.startTime));
            if (invalid) {
                toast.error('End time must be after start time for each slot.');
                return;
            }

            const payload = { ...formData, slots: formattedSlots };
            const res = await api.post(`/courses/user/${user.id}`, payload);
            setMyCourses([...myCourses, res.data]);
            setIsCreating(false);
            setFormData({ title: '', description: '', price: '', maxPeers: 5, thumbnailUrl: '', demoVideoUrl: '', meetLink: '', categoryName: '' });
            setSlots([{ date: '', startTime: '', endTime: '' }]);
            toast.success("Course published successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to publish course.');
        }
    };

    // Session lifecycle controls
    const handleStartSession = async (slotId) => {
        try {
            await api.put(`/slots/${slotId}/start`);
            toast.success('Session is now LIVE!');
            fetchStudioData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Cannot start session yet.');
        }
    };

    const handleCloseSession = async (slotId) => {
        if (!window.confirm('Close this session? Students will be able to leave reviews.')) return;
        try {
            await api.put(`/slots/${slotId}/close`);
            toast.success('Session closed. Reviews unlocked for enrolled students.');
            fetchStudioData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to close session.');
        }
    };

    const handleDeleteCourse = async (courseId) => {
        if (!window.confirm("Are you sure you want to delete this course?")) return;
        try {
            await api.delete(`/courses/${courseId}/user/${user.id}`);
            setMyCourses(myCourses.filter(c => c.id !== courseId));
            toast.success('Course deleted successfully.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete course.');
        }
    };

    const handleViewRoster = async (course) => {
        setSelectedCourseRoster(course);
        setLoadingRoster(true);
        try {
            const response = await api.get(`/bookings/course/${course.id}`);
            setRosterData(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Failed to fetch roster", error);
            toast.error("Could not load the student roster.");
        } finally {
            setLoadingRoster(false);
        }
    };

    const handleSaveProfile = async () => {
        setSavingProfile(true);
        try {
            const res = await api.put("/users/me", {
                fullName: profileForm.name,
                fieldOfStudy: profileForm.fieldOfStudy,
                bio: profileForm.bio,
                avatarUrl: profileForm.avatarUrl
            });
            setProfileData(prev => ({
                ...prev,
                name: res.data.name,
                fieldOfStudy: res.data.fieldOfStudy,
                bio: res.data.bio,
                avatarUrl: res.data.profileImage
            }));
            if (login) {
                login(res.data, localStorage.getItem("token"));
            }
            setIsEditingProfile(false);
            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.error("Failed to update profile.");
        } finally {
            setSavingProfile(false);
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const uploadData = new FormData();
        uploadData.append("file", file);
        setUploadingAvatar(true);
        try {
            const res = await api.post("/upload", uploadData, { headers: { "Content-Type": "multipart/form-data" } });
            setProfileForm(prev => ({ ...prev, avatarUrl: res.data.url }));
            toast.success("Image uploaded!");
        } catch {
            toast.error("Upload failed.");
        } finally {
            setUploadingAvatar(false);
        }
    };

    // Derived statistics
    const totalSubscribers = profileData?.subscribersCount ?? 0;
    const totalCourses = myCourses.length;
    const avgRating = profileData?.avgRating ? Number(profileData.avgRating).toFixed(1) : "5.0";
    const totalEnrolledStudents = myCourses.reduce((sum, c) => {
        return sum + (c.slots?.reduce((s, sl) => s + (sl.currentEnrolled || 0), 0) || 0);
    }, 0);

    return (
        <div style={{ background: '#0f0f0f', minHeight: '100vh', color: '#f1f1f1', paddingBottom: 80, fontFamily: 'Roboto, Inter, sans-serif' }}>
            
            {/* ── Studio Banner & Creator Overview Header ── */}
            <div style={{
                position: 'relative',
                background: 'linear-gradient(135deg, #182232 0%, #111a24 50%, #0f0f0f 100%)',
                borderBottom: '1px solid #272727',
                padding: '36px 32px 24px',
            }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
                        {/* Avatar & User Details */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                            <div style={{
                                width: 80, height: 80, borderRadius: '50%',
                                overflow: 'hidden', border: '3px solid #3f3f3f',
                                background: '#212121', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                                boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                            }}>
                                {profileData?.avatarUrl || user?.profileImage ? (
                                    <img src={profileData?.avatarUrl || user?.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span style={{ fontSize: 28, fontWeight: 700, color: '#00C2CB' }}>
                                        {user?.name?.charAt(0) || 'U'}
                                    </span>
                                )}
                            </div>

                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: '#f1f1f1', letterSpacing: '-0.4px' }}>
                                        {profileData?.name || user?.name}
                                    </h1>
                                    <span style={{
                                        background: 'rgba(0,194,203,0.15)', color: '#00C2CB',
                                        fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 12,
                                    }}>
                                        Studio
                                    </span>
                                </div>
                                <p style={{ fontSize: 13, color: '#aaaaaa', margin: '4px 0 0' }}>
                                    {profileData?.fieldOfStudy || 'Computer Science & Engineering'} &bull; {user?.email}
                                </p>
                                {profileData?.bio && (
                                    <p style={{ fontSize: 12, color: '#888888', margin: '4px 0 0', maxWidth: 600, lineHeight: 1.4 }}>
                                        {profileData.bio}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Top Action Buttons */}
                        <div style={{ display: 'flex', gap: 10 }}>
                            <Link
                                to={`/profile/${user?.id}`}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    background: '#212121', border: '1px solid #3f3f3f',
                                    color: '#f1f1f1', borderRadius: 20, padding: '8px 16px',
                                    fontSize: 13, fontWeight: 500, textDecoration: 'none',
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#2e2e2e'}
                                onMouseLeave={e => e.currentTarget.style.background = '#212121'}
                            >
                                <ExternalLink size={14} />
                                <span>Public Profile</span>
                            </Link>

                            <button
                                onClick={() => setIsCreating(!isCreating)}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    background: isCreating ? '#272727' : '#00C2CB',
                                    border: 'none',
                                    color: isCreating ? '#f1f1f1' : '#0f0f0f',
                                    borderRadius: 20, padding: '8px 18px',
                                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                    transition: 'opacity 0.15s, transform 0.1s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                            >
                                {isCreating ? <X size={16} /> : <Plus size={16} />}
                                <span>{isCreating ? 'Close Form' : 'Create Course'}</span>
                            </button>
                        </div>
                    </div>

                    {/* ── Studio Channel Stats Cards ── */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 16,
                        marginTop: 28,
                    }}>
                        <div style={{
                            background: '#181818', border: '1px solid #272727', borderRadius: 16,
                            padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 4,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 11, color: '#aaaaaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Subscribers</span>
                                <Users size={16} color="#00C2CB" />
                            </div>
                            <span style={{ fontSize: 26, fontWeight: 700, color: '#f1f1f1' }}>{totalSubscribers}</span>
                            <span style={{ fontSize: 11, color: '#777' }}>Followers on FLUX</span>
                        </div>

                        <div style={{
                            background: '#181818', border: '1px solid #272727', borderRadius: 16,
                            padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 4,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 11, color: '#aaaaaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Courses</span>
                                <BookOpen size={16} color="#3ea6ff" />
                            </div>
                            <span style={{ fontSize: 26, fontWeight: 700, color: '#f1f1f1' }}>{totalCourses}</span>
                            <span style={{ fontSize: 11, color: '#777' }}>Active listings</span>
                        </div>

                        <div style={{
                            background: '#181818', border: '1px solid #272727', borderRadius: 16,
                            padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 4,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 11, color: '#aaaaaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Enrollments</span>
                                <UserCheck size={16} color="#4ade80" />
                            </div>
                            <span style={{ fontSize: 26, fontWeight: 700, color: '#f1f1f1' }}>{totalEnrolledStudents}</span>
                            <span style={{ fontSize: 11, color: '#777' }}>Students in classes</span>
                        </div>

                        <div style={{
                            background: '#181818', border: '1px solid #272727', borderRadius: 16,
                            padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 4,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 11, color: '#aaaaaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rating</span>
                                <Star size={16} color="#facc15" fill="#facc15" />
                            </div>
                            <span style={{ fontSize: 26, fontWeight: 700, color: '#f1f1f1' }}>{avgRating}</span>
                            <span style={{ fontSize: 11, color: '#777' }}>Avg tutor score</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Studio Navigation Tabs ── */}
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
                <div style={{
                    display: 'flex', gap: 24, borderBottom: '1px solid #272727',
                    marginTop: 20, marginBottom: 28,
                }}>
                    {[
                        { key: 'courses', label: `Courses (${myCourses.length})` },
                        { key: 'subscribers', label: `Subscribers (${totalSubscribers})` },
                        { key: 'profile', label: 'Profile Details' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                borderBottom: activeTab === tab.key ? '2.5px solid #00C2CB' : '2.5px solid transparent',
                                color: activeTab === tab.key ? '#f1f1f1' : '#888888',
                                fontWeight: activeTab === tab.key ? 600 : 500,
                                fontSize: 14,
                                padding: '12px 4px',
                                cursor: 'pointer',
                                transition: 'color 0.15s',
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── CREATE COURSE FORM (Visible when isCreating) ── */}
                {isCreating && (
                    <div style={{
                        background: '#1c1c1c',
                        border: '1px solid #333333',
                        borderRadius: 16,
                        padding: 24,
                        marginBottom: 32,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid #2a2a2a', paddingBottom: 14 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Edit2 size={18} color="#00C2CB" />
                                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: '#f1f1f1' }}>Publish a New Course</h3>
                            </div>
                            <button
                                onClick={() => setIsCreating(false)}
                                style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateCourse}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                                {/* Left column */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 12, color: '#aaaaaa', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Course Title</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Spring Boot Full Course with CRUD Project"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            style={{
                                                width: '100%', background: '#121212', border: '1px solid #333',
                                                borderRadius: 8, padding: '10px 14px', color: '#f1f1f1', fontSize: 14,
                                                outline: 'none', boxSizing: 'border-box',
                                            }}
                                            onFocus={e => e.target.style.borderColor = '#00C2CB'}
                                            onBlur={e => e.target.style.borderColor = '#333'}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: 12, color: '#aaaaaa', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</label>
                                        <textarea
                                            rows="3"
                                            required
                                            placeholder="What will students learn in this course?"
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            style={{
                                                width: '100%', background: '#121212', border: '1px solid #333',
                                                borderRadius: 8, padding: '10px 14px', color: '#f1f1f1', fontSize: 14,
                                                outline: 'none', boxSizing: 'border-box',
                                            }}
                                            onFocus={e => e.target.style.borderColor = '#00C2CB'}
                                            onBlur={e => e.target.style.borderColor = '#333'}
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: 12, color: '#aaaaaa', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</label>
                                            <select
                                                required
                                                value={formData.categoryName}
                                                onChange={e => setFormData({ ...formData, categoryName: e.target.value })}
                                                style={{
                                                    width: '100%', background: '#121212', border: '1px solid #333',
                                                    borderRadius: 8, padding: '10px 12px', color: '#f1f1f1', fontSize: 13,
                                                    outline: 'none', boxSizing: 'border-box', cursor: 'pointer',
                                                }}
                                            >
                                                <option value="" disabled>Select category...</option>
                                                {CS_CATEGORIES.map(cat => (
                                                    <option key={cat} value={cat} style={{ background: '#181818' }}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: 12, color: '#aaaaaa', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price (₹)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                required
                                                placeholder="150"
                                                value={formData.price}
                                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                                style={{
                                                    width: '100%', background: '#121212', border: '1px solid #333',
                                                    borderRadius: 8, padding: '10px 14px', color: '#f1f1f1', fontSize: 14,
                                                    outline: 'none', boxSizing: 'border-box',
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: 12, color: '#aaaaaa', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Max Students Per Session</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="50"
                                            required
                                            value={formData.maxPeers}
                                            onChange={e => setFormData({ ...formData, maxPeers: e.target.value })}
                                            style={{
                                                width: '100%', background: '#121212', border: '1px solid #333',
                                                borderRadius: 8, padding: '10px 14px', color: '#f1f1f1', fontSize: 14,
                                                outline: 'none', boxSizing: 'border-box',
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Right column */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    {/* Schedule Blocks */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: 12, color: '#aaaaaa', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Class Time Blocks</label>
                                        <div style={{ background: '#141414', border: '1px solid #272727', borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                            {slots.map((slot, index) => (
                                                <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: 6, background: '#1a1a1a', borderRadius: 8, padding: 10, border: '1px solid #2e2e2e' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <span style={{ fontSize: 11, color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Slot {index + 1}</span>
                                                        {slots.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setSlots(slots.filter((_, i) => i !== index))}
                                                                style={{ background: 'transparent', border: 'none', color: '#ff5555', cursor: 'pointer', padding: 2 }}
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <input
                                                        type="date"
                                                        required
                                                        value={slot.date}
                                                        onChange={e => {
                                                            const newSlots = [...slots];
                                                            newSlots[index].date = e.target.value;
                                                            setSlots(newSlots);
                                                        }}
                                                        style={{
                                                            width: '100%', background: '#1c1c1c', border: '1px solid #333',
                                                            borderRadius: 6, padding: '8px 10px', color: '#f1f1f1', fontSize: 12,
                                                            boxSizing: 'border-box',
                                                        }}
                                                    />
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                                        <div>
                                                            <label style={{ fontSize: 10, color: '#888', display: 'block', marginBottom: 3 }}>Start Time</label>
                                                            <input
                                                                type="time"
                                                                required
                                                                value={slot.startTime}
                                                                onChange={e => {
                                                                    const newSlots = [...slots];
                                                                    newSlots[index].startTime = e.target.value;
                                                                    setSlots(newSlots);
                                                                }}
                                                                style={{
                                                                    width: '100%', background: '#1c1c1c', border: '1px solid #333',
                                                                    borderRadius: 6, padding: '8px 10px', color: '#f1f1f1', fontSize: 12,
                                                                    boxSizing: 'border-box',
                                                                }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label style={{ fontSize: 10, color: '#888', display: 'block', marginBottom: 3 }}>End Time</label>
                                                            <input
                                                                type="time"
                                                                required
                                                                value={slot.endTime}
                                                                onChange={e => {
                                                                    const newSlots = [...slots];
                                                                    newSlots[index].endTime = e.target.value;
                                                                    setSlots(newSlots);
                                                                }}
                                                                style={{
                                                                    width: '100%', background: '#1c1c1c', border: '1px solid #333',
                                                                    borderRadius: 6, padding: '8px 10px', color: '#f1f1f1', fontSize: 12,
                                                                    boxSizing: 'border-box',
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => setSlots([...slots, { date: '', startTime: '', endTime: '' }])}
                                                style={{
                                                    background: '#222', border: '1px dashed #444', borderRadius: 6,
                                                    padding: '6px 12px', color: '#aaa', fontSize: 12, cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                                    marginTop: 4,
                                                }}
                                            >
                                                <Plus size={14} /> Add Another Time Block
                                            </button>
                                        </div>
                                    </div>


                                    {/* Thumbnail Upload */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: 12, color: '#aaaaaa', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Thumbnail</label>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            {formData.thumbnailUrl && (
                                                <div style={{ width: '100%', height: 120, borderRadius: 8, overflow: 'hidden', border: '1px solid #333' }}>
                                                    <img src={formData.thumbnailUrl} alt="Thumbnail preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                            )}
                                            <label style={{
                                                background: '#181818', border: '1px dashed #3f3f3f', borderRadius: 8,
                                                padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                gap: 8, cursor: 'pointer', color: '#00C2CB', fontSize: 13,
                                            }}>
                                                <Upload size={16} />
                                                <span>{formData.thumbnailUrl ? 'Change Thumbnail Image' : 'Upload Thumbnail Image'}</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    style={{ display: 'none' }}
                                                    onChange={async (e) => {
                                                        const file = e.target.files[0];
                                                        if (!file) return;
                                                        const uploadData = new FormData();
                                                        uploadData.append("file", file);
                                                        try {
                                                            const res = await api.post('/upload', uploadData, { headers: { 'Content-Type': 'multipart/form-data' } });
                                                            setFormData({ ...formData, thumbnailUrl: res.data.url });
                                                            toast.success("Thumbnail uploaded!");
                                                        } catch {
                                                            toast.error("Thumbnail upload failed.");
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: 12, color: '#aaaaaa', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Meeting Link</label>
                                            <input
                                                type="url"
                                                required
                                                placeholder="https://meet.google.com/..."
                                                value={formData.meetLink}
                                                onChange={e => setFormData({ ...formData, meetLink: e.target.value })}
                                                style={{
                                                    width: '100%', background: '#121212', border: '1px solid #333',
                                                    borderRadius: 8, padding: '10px 12px', color: '#f1f1f1', fontSize: 13,
                                                    outline: 'none', boxSizing: 'border-box',
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: 12, color: '#aaaaaa', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Demo Video (Optional)</label>
                                            <input
                                                type="url"
                                                placeholder="https://youtube.com/..."
                                                value={formData.demoVideoUrl}
                                                onChange={e => setFormData({ ...formData, demoVideoUrl: e.target.value })}
                                                style={{
                                                    width: '100%', background: '#121212', border: '1px solid #333',
                                                    borderRadius: 8, padding: '10px 12px', color: '#f1f1f1', fontSize: 13,
                                                    outline: 'none', boxSizing: 'border-box',
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #2a2a2a', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    style={{
                                        background: 'transparent', border: '1px solid #3f3f3f', color: '#ccc',
                                        borderRadius: 20, padding: '10px 20px', fontSize: 13, cursor: 'pointer',
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        background: '#00C2CB', border: 'none', color: '#0f0f0f',
                                        borderRadius: 20, padding: '10px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                    }}
                                >
                                    Publish Course
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ── TAB 1: COURSES MANAGEMENT ── */}
                {activeTab === 'courses' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <div>
                                <h2 style={{ fontSize: 18, fontWeight: 600, color: '#f1f1f1', margin: 0 }}>Your Published Courses</h2>
                                <p style={{ fontSize: 12, color: '#888', margin: '4px 0 0' }}>Manage course details, schedule blocks, view enrolled students, or remove listings.</p>
                            </div>
                            <span style={{ fontSize: 12, color: '#00C2CB', background: 'rgba(0,194,203,0.1)', padding: '4px 12px', borderRadius: 20, fontWeight: 600 }}>
                                {myCourses.length} Courses
                            </span>
                        </div>

                        {myCourses.length === 0 ? (
                            <div style={{
                                textAlign: 'center', padding: '60px 20px',
                                background: '#141414', borderRadius: 16, border: '1px dashed #333',
                            }}>
                                <BookOpen size={40} color="#555" style={{ margin: '0 auto 12px' }} />
                                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#eee', margin: '0 0 6px' }}>No courses published yet</h3>
                                <p style={{ fontSize: 13, color: '#888', margin: '0 0 16px', maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
                                    Start tutoring on FLUX by publishing your first course. Share your knowledge with peers!
                                </p>
                                <button
                                    onClick={() => setIsCreating(true)}
                                    style={{
                                        background: '#00C2CB', border: 'none', color: '#0f0f0f',
                                        borderRadius: 20, padding: '9px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                    }}
                                >
                                    Create Your First Course
                                </button>
                            </div>
                        ) : (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                                gap: 20,
                            }}>
                                {myCourses.map(course => (
                                    <div
                                        key={course.id}
                                        style={{
                                            background: '#1b1b1b',
                                            border: '1px solid #2d2d2d',
                                            borderRadius: 16,
                                            overflow: 'hidden',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            transition: 'border-color 0.2s, transform 0.2s',
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.borderColor = '#444';
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.borderColor = '#2d2d2d';
                                            e.currentTarget.style.transform = 'none';
                                        }}
                                    >
                                        <div>
                                            {/* Thumbnail block */}
                                            <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#111', overflow: 'hidden' }}>
                                                {course.thumbnailUrl ? (
                                                    <img
                                                        src={course.thumbnailUrl}
                                                        alt={course.title}
                                                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: 11, fontWeight: 600 }}>
                                                        No Preview
                                                    </div>
                                                )}
                                                {course.categoryName && (
                                                    <span style={{
                                                        position: 'absolute', bottom: 8, left: 8,
                                                        background: 'rgba(0,0,0,0.8)', color: '#f1f1f1',
                                                        fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 4,
                                                    }}>
                                                        {course.categoryName}
                                                    </span>
                                                )}
                                                <span style={{
                                                    position: 'absolute', top: 8, right: 8,
                                                    background: 'rgba(0,194,203,0.9)', color: '#0f0f0f',
                                                    fontSize: 12, fontWeight: 700, padding: '3px 9px', borderRadius: 6,
                                                }}>
                                                    ₹{course.price}
                                                </span>
                                            </div>

                                            {/* Info */}
                                            <div style={{ padding: 16 }}>
                                                <h3 style={{
                                                    fontSize: 15, fontWeight: 600, color: '#f1f1f1', margin: '0 0 8px',
                                                    lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                                }}>
                                                    {course.title}
                                                </h3>

                                                {/* Slots summary with session controls */}
                                                <div style={{ background: '#141414', borderRadius: 8, padding: 10, border: '1px solid #252525' }}>
                                                    <span style={{ fontSize: 10, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
                                                        Sessions ({course.slots?.length || 0})
                                                    </span>
                                                    {course.slots && course.slots.length > 0 ? (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto' }}>
                                                            {course.slots.map(slot => {
                                                                const start = slot.startTime ? new Date(slot.startTime) : null;
                                                                const end = slot.endTime ? new Date(slot.endTime) : null;
                                                                const now = new Date();
                                                                const canStart = slot.sessionStatus === 'SCHEDULED' && start && (start - now) <= 15 * 60 * 1000;
                                                                const statusColors = {
                                                                    SCHEDULED: { bg: 'rgba(250,204,21,0.15)', color: '#facc15' },
                                                                    LIVE:      { bg: 'rgba(74,222,128,0.15)', color: '#4ade80' },
                                                                    CLOSED:    { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
                                                                    EXPIRED:   { bg: 'rgba(239,68,68,0.1)',   color: '#888' },
                                                                };
                                                                const sc = statusColors[slot.sessionStatus] || statusColors.SCHEDULED;
                                                                return (
                                                                    <div key={slot.id} style={{ background: '#1a1a1a', borderRadius: 6, padding: 8, border: '1px solid #2a2a2a' }}>
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                                                            <span style={{ fontSize: 11, color: '#ccc' }}>
                                                                                {start ? start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '?'}
                                                                                {' '}
                                                                                {start ? start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : ''}
                                                                                {end ? ` – ${end.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}` : ''}
                                                                            </span>
                                                                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10, background: sc.bg, color: sc.color }}>
                                                                                {slot.sessionStatus}
                                                                            </span>
                                                                        </div>
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                            <span style={{ fontSize: 11, color: slot.currentEnrolled >= slot.maxSeats ? '#ff5555' : '#4ade80', fontWeight: 600 }}>
                                                                                {slot.currentEnrolled}/{slot.maxSeats} enrolled
                                                                            </span>
                                                                            <div style={{ display: 'flex', gap: 6 }}>
                                                                                {slot.sessionStatus === 'SCHEDULED' && (
                                                                                    <button
                                                                                        onClick={() => handleStartSession(slot.id)}
                                                                                        disabled={!canStart}
                                                                                        title={canStart ? 'Start session now' : 'Available 15 min before start'}
                                                                                        style={{
                                                                                            fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 6, border: 'none',
                                                                                            cursor: canStart ? 'pointer' : 'not-allowed',
                                                                                            background: canStart ? 'rgba(74,222,128,0.2)' : '#1c1c1c',
                                                                                            color: canStart ? '#4ade80' : '#555',
                                                                                            transition: 'all 0.15s',
                                                                                        }}
                                                                                    >
                                                                                        ▶ Start
                                                                                    </button>
                                                                                )}
                                                                                {slot.sessionStatus === 'LIVE' && (
                                                                                    <button
                                                                                        onClick={() => handleCloseSession(slot.id)}
                                                                                        style={{
                                                                                            fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 6, border: 'none',
                                                                                            cursor: 'pointer',
                                                                                            background: 'rgba(239,68,68,0.2)', color: '#ef4444',
                                                                                            animation: 'pulse 1.5s infinite',
                                                                                        }}
                                                                                    >
                                                                                        ■ Close
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <span style={{ fontSize: 11, color: '#666', fontStyle: 'italic' }}>No scheduled slots
</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div style={{ padding: '0 16px 16px', display: 'flex', gap: 8 }}>
                                            <button
                                                onClick={() => handleViewRoster(course)}
                                                style={{
                                                    flex: 1, padding: '8px 0', borderRadius: 8,
                                                    background: '#282828', border: '1px solid #383838',
                                                    color: '#f1f1f1', fontSize: 12, fontWeight: 600,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                                    cursor: 'pointer', transition: 'background 0.15s',
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#333'}
                                                onMouseLeave={e => e.currentTarget.style.background = '#282828'}
                                            >
                                                <Eye size={14} color="#00C2CB" />
                                                <span>Students</span>
                                            </button>

                                            <button
                                                onClick={() => handleDeleteCourse(course.id)}
                                                style={{
                                                    padding: '8px 14px', borderRadius: 8,
                                                    background: 'rgba(255,85,85,0.1)', border: '1px solid rgba(255,85,85,0.2)',
                                                    color: '#ff5555', fontSize: 12, fontWeight: 600,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                                                    cursor: 'pointer', transition: 'background 0.15s',
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,85,85,0.2)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,85,85,0.1)'}
                                                title="Delete Course"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── TAB 2: SUBSCRIBERS MANAGEMENT ── */}
                {activeTab === 'subscribers' && (
                    <div style={{ background: '#181818', border: '1px solid #272727', borderRadius: 16, padding: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <div>
                                <h2 style={{ fontSize: 18, fontWeight: 600, color: '#f1f1f1', margin: 0 }}>Community Subscribers</h2>
                                <p style={{ fontSize: 12, color: '#888', margin: '4px 0 0' }}>Students who follow your profile to get updates when you publish new courses.</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: 28, fontWeight: 800, color: '#00C2CB', display: 'block' }}>{totalSubscribers}</span>
                                <span style={{ fontSize: 11, color: '#777', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Subscribers</span>
                            </div>
                        </div>

                        <div style={{
                            background: '#121212', borderRadius: 12, border: '1px solid #222',
                            padding: 24, textAlign: 'center',
                        }}>
                            <Users size={48} color="#00C2CB" style={{ margin: '0 auto 12px', opacity: 0.8 }} />
                            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#eee', margin: '0 0 6px' }}>
                                {totalSubscribers > 0 ? `You have ${totalSubscribers} active subscribers!` : "No subscribers yet"}
                            </h3>
                            <p style={{ fontSize: 13, color: '#888', maxWidth: 440, margin: '0 auto 16px', lineHeight: 1.5 }}>
                                {totalSubscribers > 0 
                                    ? "When you launch new courses, your subscribers are instantly notified on their dashboard and notifications feed."
                                    : "Share your courses or public profile link with peers to grow your audience and build your tutoring network."}
                            </p>
                            <Link
                                to={`/profile/${user?.id}`}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    background: '#00C2CB', color: '#0f0f0f',
                                    borderRadius: 20, padding: '8px 20px', fontSize: 13, fontWeight: 600,
                                    textDecoration: 'none',
                                }}
                            >
                                <ExternalLink size={14} />
                                <span>Preview Public Channel</span>
                            </Link>
                        </div>
                    </div>
                )}

                {/* ── TAB 3: PROFILE DETAILS & INLINE EDIT ── */}
                {activeTab === 'profile' && (
                    <div style={{ background: '#181818', border: '1px solid #272727', borderRadius: 16, padding: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid #272727', paddingBottom: 16 }}>
                            <div>
                                <h2 style={{ fontSize: 18, fontWeight: 600, color: '#f1f1f1', margin: 0 }}>Creator Profile</h2>
                                <p style={{ fontSize: 12, color: '#888', margin: '4px 0 0' }}>Your identity across FLUX. Students see this information on your course cards and profile.</p>
                            </div>
                            <button
                                onClick={() => setIsEditingProfile(!isEditingProfile)}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    background: isEditingProfile ? '#272727' : '#00C2CB',
                                    color: isEditingProfile ? '#f1f1f1' : '#0f0f0f',
                                    border: 'none', borderRadius: 20, padding: '7px 16px',
                                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                }}
                            >
                                <Edit2 size={13} />
                                <span>{isEditingProfile ? 'Cancel' : 'Edit Profile'}</span>
                            </button>
                        </div>

                        {isEditingProfile ? (
                            <div style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {/* Avatar uploader */}
                                <div>
                                    <label style={{ display: 'block', fontSize: 12, color: '#aaa', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase' }}>Profile Picture</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                        <div style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', background: '#222', border: '2px solid #444', flexShrink: 0 }}>
                                            {profileForm.avatarUrl ? (
                                                <img src={profileForm.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00C2CB', fontWeight: 700 }}>
                                                    {user?.name?.charAt(0) || 'U'}
                                                </div>
                                            )}
                                        </div>
                                        <label style={{
                                            background: '#242424', border: '1px solid #383838', borderRadius: 8,
                                            padding: '8px 14px', color: '#00C2CB', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                            display: 'inline-flex', alignItems: 'center', gap: 6,
                                        }}>
                                            <Upload size={14} />
                                            <span>{uploadingAvatar ? 'Uploading...' : 'Upload New Photo'}</span>
                                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: 12, color: '#aaa', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase' }}>Full Name</label>
                                    <input
                                        type="text"
                                        value={profileForm.name}
                                        onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                                        style={{ width: '100%', background: '#121212', border: '1px solid #333', borderRadius: 8, padding: '10px 14px', color: '#f1f1f1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: 12, color: '#aaa', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase' }}>Field of Study / Headline</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Full-Stack Developer & Cloud Enthusiast"
                                        value={profileForm.fieldOfStudy}
                                        onChange={e => setProfileForm({ ...profileForm, fieldOfStudy: e.target.value })}
                                        style={{ width: '100%', background: '#121212', border: '1px solid #333', borderRadius: 8, padding: '10px 14px', color: '#f1f1f1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: 12, color: '#aaa', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase' }}>Bio</label>
                                    <textarea
                                        rows="4"
                                        placeholder="Tell learners about your experience, teaching style, and expertise..."
                                        value={profileForm.bio}
                                        onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                                        style={{ width: '100%', background: '#121212', border: '1px solid #333', borderRadius: 8, padding: '10px 14px', color: '#f1f1f1', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditingProfile(false)}
                                        style={{ background: 'transparent', border: '1px solid #3f3f3f', color: '#aaa', borderRadius: 20, padding: '8px 18px', fontSize: 13, cursor: 'pointer' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        disabled={savingProfile}
                                        onClick={handleSaveProfile}
                                        style={{ background: '#00C2CB', border: 'none', color: '#0f0f0f', borderRadius: 20, padding: '8px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                                    >
                                        {savingProfile ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', border: '2px solid #3f3f3f', background: '#222' }}>
                                        {profileData?.avatarUrl || user?.profileImage ? (
                                            <img src={profileData?.avatarUrl || user?.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00C2CB', fontSize: 24, fontWeight: 700 }}>
                                                {user?.name?.charAt(0) || 'U'}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 2px', color: '#f1f1f1' }}>{profileData?.name || user?.name}</h3>
                                        <p style={{ fontSize: 13, color: '#00C2CB', margin: '0 0 4px', fontWeight: 500 }}>{profileData?.fieldOfStudy || 'Student & Creator'}</p>
                                        <p style={{ fontSize: 12, color: '#777', margin: 0 }}>{user?.email}</p>
                                    </div>
                                </div>

                                <div style={{ background: '#121212', borderRadius: 12, padding: 16, border: '1px solid #242424' }}>
                                    <span style={{ fontSize: 11, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>About & Bio</span>
                                    <p style={{ fontSize: 13, color: '#ccc', margin: 0, lineHeight: 1.6 }}>
                                        {profileData?.bio || "No bio added yet. Click 'Edit Profile' to introduce yourself to your students!"}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Student Roster Modal ── */}
            {selectedCourseRoster && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 100,
                    background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
                }}>
                    <div style={{
                        background: '#1c1c1c', border: '1px solid #383838', borderRadius: 20,
                        width: '100%', maxWidth: 640, maxHeight: '85vh', overflow: 'hidden',
                        display: 'flex', flexDirection: 'column',
                        boxShadow: '0 16px 48px rgba(0,0,0,0.8)',
                    }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #2d2d2d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#f1f1f1' }}>Student Roster</h3>
                                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#888' }}>{selectedCourseRoster.title}</p>
                            </div>
                            <button
                                onClick={() => setSelectedCourseRoster(null)}
                                style={{ background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
                            {loadingRoster ? (
                                <div style={{ textAlign: 'center', padding: '40px 0', color: '#888', fontSize: 13 }}>Loading enrolled students...</div>
                            ) : rosterData.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px 0', color: '#777', fontSize: 13 }}>
                                    No students enrolled in this course yet.
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {rosterData.map(booking => (
                                        <div key={booking.id} style={{
                                            background: '#141414', border: '1px solid #272727', borderRadius: 12,
                                            padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{
                                                    width: 38, height: 38, borderRadius: '50%',
                                                    background: '#242424', color: '#00C2CB',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontWeight: 700, fontSize: 14, border: '1px solid #383838',
                                                }}>
                                                    {booking.student?.name?.charAt(0) || 'S'}
                                                </div>
                                                <div>
                                                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#f1f1f1' }}>{booking.student?.name}</p>
                                                    <p style={{ margin: 0, fontSize: 11, color: '#888' }}>{booking.student?.email}</p>
                                                </div>
                                            </div>

                                            <div style={{ textAlign: 'right' }}>
                                                <span style={{ fontSize: 10, background: 'rgba(74,222,128,0.15)', color: '#4ade80', padding: '3px 8px', borderRadius: 10, fontWeight: 600 }}>
                                                    Enrolled
                                                </span>
                                                <p style={{ margin: '4px 0 0', fontSize: 11, color: '#777' }}>
                                                    {booking.slot?.slotDateTime ? new Date(booking.slot.slotDateTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Scheduled'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
