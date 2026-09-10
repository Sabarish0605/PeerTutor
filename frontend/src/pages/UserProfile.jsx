import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import { toast } from "react-hot-toast";
import EnrollmentModal from "../components/EnrollmentModal";
import {
    ArrowLeft, Check, Plus, Star, Calendar, Clock, Video, PlayCircle,
    Edit3, Globe, Code2, ExternalLink, CheckCircle2, BookOpen, Award,
    Sparkles, X, ChevronRight, Share2
} from "lucide-react";

export default function UserProfile() {
    const { id } = useParams();
    const { user, login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [courses, setCourses] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscribing, setSubscribing] = useState(false);
    const [activeTab, setActiveTab] = useState("Home");

    // Modal states
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: "", fieldOfStudy: "", bio: "", avatarUrl: "" });
    const [uploading, setUploading] = useState(false);
    const [enrollingCourse, setEnrollingCourse] = useState(null);

    const isOwnProfile = user?.id === parseInt(id);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/users/public/${id}`);
                setProfile(res.data);
                if (isOwnProfile) {
                    setEditForm({
                        name: res.data.name || "",
                        fieldOfStudy: res.data.fieldOfStudy || "",
                        bio: res.data.bio || "",
                        avatarUrl: res.data.avatarUrl || ""
                    });
                }
                if (!isOwnProfile && user?.id) {
                    const subRes = await api.get(`/subscriptions/check/student/${user.id}/tutor/${id}`);
                    setIsSubscribed(subRes.data.subscribed);
                }

                const [coursesRes, reviewsRes] = await Promise.all([
                    api.get(`/courses/user/${id}`).catch(() => ({ data: [] })),
                    api.get(`/reviews/tutor/${id}`).catch(() => ({ data: [] }))
                ]);

                const courseList = Array.isArray(coursesRes.data) ? coursesRes.data : [];
                setCourses(courseList);
                setReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : []);
                setProfile(prev => ({ ...prev, coursesCount: courseList.length }));
            } catch (err) {
                console.error("Failed to fetch profile", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [id, user, isOwnProfile]);

    const handleSubscribe = async () => {
        if (!user) {
            toast.error("Please log in to subscribe.");
            navigate("/login");
            return;
        }
        setSubscribing(true);
        try {
            const res = await api.post(`/subscriptions/student/${user.id}/tutor/${id}`);
            setIsSubscribed(res.data.subscribed);
            setProfile(prev => ({
                ...prev,
                subscribersCount: (prev.subscribersCount || 0) + (res.data.subscribed ? 1 : -1)
            }));
            toast.success(res.data.subscribed ? "Subscribed to tutor!" : "Unsubscribed.");
        } catch {
            toast.error("Subscription failed.");
        } finally {
            setSubscribing(false);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put("/users/me", {
                fullName: editForm.name,
                fieldOfStudy: editForm.fieldOfStudy,
                bio: editForm.bio,
                avatarUrl: editForm.avatarUrl
            });
            setProfile(prev => ({
                ...prev,
                name: res.data.name,
                fieldOfStudy: res.data.fieldOfStudy,
                bio: res.data.bio,
                avatarUrl: res.data.profileImage
            }));
            login(res.data, localStorage.getItem("token"));
            setIsEditing(false);
            toast.success("Profile updated successfully!");
        } catch {
            toast.error("Failed to update profile.");
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);
        setUploading(true);
        try {
            const res = await api.post("/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
            setEditForm(prev => ({ ...prev, avatarUrl: res.data.url }));
            toast.success("Profile image uploaded!");
        } catch {
            toast.error("Image upload failed.");
        } finally {
            setUploading(false);
        }
    };

    const handleConfirmEnrollment = async (slotId) => {
        if (!user) {
            toast.error("Please log in to enroll.");
            navigate("/login");
            return;
        }
        try {
            await api.post(`/bookings/student/${user.id}/course/${enrollingCourse.id}/slot/${slotId}`);
            toast.success("Successfully enrolled in course!");
            setEnrollingCourse(null);
        } catch (error) {
            toast.error(error.response?.data?.message || "Enrollment failed.");
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Profile link copied to clipboard!");
    };

    if (loading) {
        return (
            <div style={{
                background: "#0f0f0f", minHeight: "100vh",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#aaaaaa", fontSize: 14, fontFamily: "Roboto, Inter, sans-serif"
            }}>
                Loading channel profile...
            </div>
        );
    }

    const featuredCourse = courses.length > 0 ? courses[0] : null;
    const avatarInitial = (profile?.name || "T").charAt(0).toUpperCase();
    const handleTag = `@${(profile?.name || "tutor").toLowerCase().replace(/[^a-z0-9]/g, "")}`;
    const tabs = ["Home", "Courses", "Reviews", "About"];

    return (
        <div style={{
            background: "#0f0f0f",
            minHeight: "100vh",
            color: "#f1f1f1",
            fontFamily: "Roboto, Inter, sans-serif",
            padding: "0 0 80px",
        }}>
            {/* Top Navigation Row */}
            <div style={{
                maxWidth: 1200,
                margin: "0 auto",
                padding: "16px 24px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
            }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#aaaaaa",
                        background: "#212121",
                        border: "1px solid #333333",
                        borderRadius: 20,
                        padding: "6px 14px",
                        cursor: "pointer",
                        transition: "background 0.15s, color 0.15s"
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#2a2a2a"; e.currentTarget.style.color = "#ffffff"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#212121"; e.currentTarget.style.color = "#aaaaaa"; }}
                >
                    <ArrowLeft size={15} />
                    <span>Back</span>
                </button>

                <button
                    onClick={handleShare}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#aaaaaa",
                        background: "#212121",
                        border: "1px solid #333333",
                        borderRadius: 20,
                        padding: "6px 14px",
                        cursor: "pointer",
                        transition: "background 0.15s, color 0.15s"
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#2a2a2a"; e.currentTarget.style.color = "#ffffff"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#212121"; e.currentTarget.style.color = "#aaaaaa"; }}
                >
                    <Share2 size={14} />
                    <span>Share</span>
                </button>
            </div>

            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
                {/* ── YouTube-Style Channel Banner (Carbon / Tech Texture with Stats Badges) ── */}
                <div style={{
                    height: 200,
                    width: "100%",
                    borderRadius: 20,
                    position: "relative",
                    overflow: "hidden",
                    background: `
                        radial-gradient(ellipse at 80% 20%, rgba(0, 194, 203, 0.25) 0%, transparent 60%),
                        radial-gradient(ellipse at 20% 90%, rgba(20, 40, 60, 0.6) 0%, transparent 70%),
                        linear-gradient(135deg, #121212 0%, #1a1a1a 50%, #0d151a 100%)
                    `,
                    border: "1px solid #272727",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 36px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
                }}>
                    {/* Subtle Carbon Grid Pattern */}
                    <div style={{
                        position: "absolute", inset: 0, pointerEvents: "none",
                        backgroundImage: `
                            linear-gradient(45deg, #161616 25%, transparent 25%), 
                            linear-gradient(-45deg, #161616 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #161616 75%), 
                            linear-gradient(-45deg, transparent 75%, #161616 75%)
                        `,
                        backgroundSize: "20px 20px",
                        backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                        opacity: 0.35,
                    }} />

                    {/* Left Banner Branding / Motto */}
                    <div style={{ position: "relative", zIndex: 2 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                            <span style={{
                                width: 8, height: 8, borderRadius: "50%", background: "#00C2CB",
                                boxShadow: "0 0 10px #00C2CB"
                            }} />
                            <span style={{ fontSize: 12, fontWeight: 700, color: "#00C2CB", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                                FLUX Peer Tutor Hub
                            </span>
                        </div>
                        <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.5px" }}>
                            {profile?.name}
                        </h2>
                        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#aaaaaa" }}>
                            {profile?.fieldOfStudy || "Interactive 1-on-1 Learning & Code Mentorship"}
                        </p>
                    </div>

                    {/* Right Banner Stats Badges (Inspired by MotoWagon reference) */}
                    <div style={{
                        display: "flex",
                        gap: 12,
                        position: "relative",
                        zIndex: 2,
                        flexWrap: "wrap",
                        justifyContent: "flex-end"
                    }}>
                        {[
                            { label: "COURSES", value: courses.length },
                            { label: "STUDENTS", value: profile?.subscribersCount || 0 },
                            { label: "RATING", value: profile?.avgRating ? `${Number(profile.avgRating).toFixed(1)} ★` : "5.0 ★" },
                            { label: "REVIEWS", value: reviews.length },
                        ].map((stat, i) => (
                            <div
                                key={i}
                                style={{
                                    background: "rgba(15, 15, 15, 0.75)",
                                    backdropFilter: "blur(8px)",
                                    border: "1px solid rgba(255, 255, 255, 0.1)",
                                    borderRadius: 12,
                                    padding: "8px 14px",
                                    textAlign: "center",
                                    minWidth: 78,
                                }}
                            >
                                <div style={{ fontSize: 16, fontWeight: 800, color: "#ffffff", lineHeight: 1.1 }}>
                                    {stat.value}
                                </div>
                                <div style={{ fontSize: 10, fontWeight: 700, color: "#00C2CB", letterSpacing: "0.08em", marginTop: 4 }}>
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Creator Profile Header (Avatar Left, Info, Actions Right) ── */}
                <div style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 24,
                    padding: "20px 8px 24px",
                    borderBottom: "1px solid #272727",
                    position: "relative"
                }}>
                    {/* Big Circular Avatar with YouTube-Style Ring */}
                    <div style={{
                        width: 128,
                        height: 128,
                        borderRadius: "50%",
                        border: "4px solid #0f0f0f",
                        boxShadow: "0 0 0 2px #272727, 0 8px 24px rgba(0,0,0,0.5)",
                        background: "#1c1c1c",
                        overflow: "hidden",
                        flexShrink: 0,
                        marginTop: -44,
                        position: "relative",
                        zIndex: 3,
                    }}>
                        {profile?.avatarUrl ? (
                            <img
                                src={profile.avatarUrl}
                                alt={profile?.name}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                        ) : (
                            <div style={{
                                width: "100%", height: "100%",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                background: "#1a3a3a", color: "#00C2CB",
                                fontSize: 44, fontWeight: 800
                            }}>
                                {avatarInitial}
                            </div>
                        )}
                    </div>

                    {/* Creator Identity & Meta */}
                    <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
                        {/* Name + Verified Checkmark */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <h1 style={{
                                margin: 0, fontSize: 24, fontWeight: 800,
                                color: "#f1f1f1", letterSpacing: "-0.4px"
                            }}>
                                {profile?.name}
                            </h1>
                            <span title="Verified FLUX Tutor" style={{ display: "inline-flex", alignItems: "center", color: "#00C2CB" }}>
                                <CheckCircle2 size={18} fill="#00C2CB" color="#0f0f0f" />
                            </span>
                        </div>

                        {/* Handle & Stats Line (YouTube Format) */}
                        <div style={{
                            display: "flex", alignItems: "center", gap: 8,
                            fontSize: 13, color: "#aaaaaa", marginTop: 4, flexWrap: "wrap"
                        }}>
                            <span style={{ fontWeight: 600, color: "#f1f1f1" }}>{handleTag}</span>
                            <span>•</span>
                            <span>{profile?.subscribersCount || 0} subscriber{profile?.subscribersCount !== 1 ? 's' : ''}</span>
                            <span>•</span>
                            <span>{courses.length} course{courses.length !== 1 ? 's' : ''}</span>
                            {reviews.length > 0 && (
                                <>
                                    <span>•</span>
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                        <Star size={13} fill="#facc15" color="#facc15" />
                                        <strong style={{ color: "#f1f1f1" }}>
                                            {profile?.avgRating ? Number(profile.avgRating).toFixed(1) : "5.0"}
                                        </strong>
                                        <span>({reviews.length} reviews)</span>
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Bio snippet */}
                        <p style={{
                            margin: "8px 0 0",
                            fontSize: 13,
                            color: "#cccccc",
                            lineHeight: 1.5,
                            maxWidth: 720,
                        }}>
                            {profile?.bio || "Peer tutor helping university students and developers excel in computer science, system architecture, and modern programming."}
                        </p>

                        {/* Social / Tag Pills */}
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                            <span style={{
                                display: "inline-flex", alignItems: "center", gap: 5,
                                fontSize: 12, color: "#00C2CB", fontWeight: 500,
                                background: "rgba(0,194,203,0.1)",
                                border: "1px solid rgba(0,194,203,0.25)",
                                padding: "3px 10px", borderRadius: 16
                            }}>
                                🎓 {profile?.fieldOfStudy || "Computer Science"}
                            </span>

                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                    display: "inline-flex", alignItems: "center", gap: 5,
                                    fontSize: 12, color: "#aaaaaa", textDecoration: "none",
                                    background: "#1c1c1c", border: "1px solid #333333",
                                    padding: "3px 10px", borderRadius: 16, transition: "color 0.15s"
                                }}
                                onMouseEnter={e => e.currentTarget.style.color = "#ffffff"}
                                onMouseLeave={e => e.currentTarget.style.color = "#aaaaaa"}
                            >
                                <Code2 size={12} />
                                <span>Code / Repos</span>
                            </a>

                            <a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                    display: "inline-flex", alignItems: "center", gap: 5,
                                    fontSize: 12, color: "#aaaaaa", textDecoration: "none",
                                    background: "#1c1c1c", border: "1px solid #333333",
                                    padding: "3px 10px", borderRadius: 16, transition: "color 0.15s"
                                }}
                                onMouseEnter={e => e.currentTarget.style.color = "#ffffff"}
                                onMouseLeave={e => e.currentTarget.style.color = "#aaaaaa"}
                            >
                                <Globe size={12} />
                                <span>Portfolio</span>
                            </a>
                        </div>
                    </div>

                    {/* Action Buttons: Subscribe or Edit Profile */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, marginTop: 4 }}>
                        {isOwnProfile ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                style={{
                                    display: "inline-flex", alignItems: "center", gap: 6,
                                    background: "#272727", color: "#f1f1f1",
                                    border: "1px solid #3f3f3f",
                                    borderRadius: 20, padding: "9px 20px",
                                    fontSize: 13, fontWeight: 700, cursor: "pointer",
                                    transition: "background 0.15s"
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = "#383838"}
                                onMouseLeave={e => e.currentTarget.style.background = "#272727"}
                            >
                                <Edit3 size={15} />
                                <span>Edit Profile</span>
                            </button>
                        ) : (
                            <button
                                onClick={handleSubscribe}
                                disabled={subscribing}
                                style={{
                                    display: "inline-flex", alignItems: "center", gap: 6,
                                    background: isSubscribed ? "#272727" : "#00C2CB",
                                    color: isSubscribed ? "#f1f1f1" : "#0f0f0f",
                                    border: isSubscribed ? "1px solid #3f3f3f" : "none",
                                    borderRadius: 20, padding: "9px 24px",
                                    fontSize: 13, fontWeight: 700, cursor: "pointer",
                                    transition: "opacity 0.15s, transform 0.1s",
                                }}
                                onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
                                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                            >
                                {isSubscribed ? (
                                    <>
                                        <Check size={16} />
                                        <span>Subscribed</span>
                                    </>
                                ) : (
                                    <>
                                        <Plus size={16} strokeWidth={2.5} />
                                        <span>Subscribe</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* ── YouTube-Style Channel Tabs Bar ── */}
                <div style={{
                    display: "flex",
                    gap: 32,
                    borderBottom: "1px solid #272727",
                    marginTop: 4,
                }}>
                    {tabs.map(tab => {
                        const active = activeTab === tab;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    background: "transparent",
                                    border: "none",
                                    borderBottom: active ? "2.5px solid #f1f1f1" : "2.5px solid transparent",
                                    color: active ? "#ffffff" : "#aaaaaa",
                                    fontSize: 14,
                                    fontWeight: active ? 700 : 500,
                                    padding: "14px 0",
                                    cursor: "pointer",
                                    transition: "color 0.15s",
                                    letterSpacing: "-0.2px"
                                }}
                                onMouseEnter={e => { if (!active) e.currentTarget.style.color = "#ffffff"; }}
                                onMouseLeave={e => { if (!active) e.currentTarget.style.color = "#aaaaaa"; }}
                            >
                                {tab}
                            </button>
                        );
                    })}
                </div>

                {/* ── Tab Content Area ── */}
                <div style={{ paddingTop: 24 }}>
                    {/* TAB 1: HOME */}
                    {activeTab === "Home" && (
                        <div>
                            {/* Featured Spotlight Course (Inspired by YouTube Channel Trailer in MotoWagon reference) */}
                            {featuredCourse && (
                                <div style={{
                                    background: "#161616",
                                    border: "1px solid #272727",
                                    borderRadius: 18,
                                    padding: 20,
                                    marginBottom: 32,
                                    display: "flex",
                                    gap: 24,
                                    alignItems: "center",
                                    flexWrap: "wrap"
                                }}>
                                    {/* 16:9 Featured Thumbnail */}
                                    <div style={{
                                        position: "relative",
                                        width: "100%",
                                        maxWidth: 380,
                                        paddingTop: "22%",
                                        borderRadius: 14,
                                        overflow: "hidden",
                                        background: "#1c1c1c",
                                        flexShrink: 0,
                                    }}>
                                        {featuredCourse.thumbnailUrl ? (
                                            <img
                                                src={featuredCourse.thumbnailUrl}
                                                alt={featuredCourse.title}
                                                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                                            />
                                        ) : (
                                            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#666", fontSize: 12, fontWeight: 600 }}>
                                                Featured Course
                                            </div>
                                        )}

                                        {featuredCourse.demoVideoUrl && (
                                            <button
                                                onClick={() => window.open(featuredCourse.demoVideoUrl, "_blank")}
                                                style={{
                                                    position: "absolute", inset: 0, margin: "auto",
                                                    width: 48, height: 48, borderRadius: "50%",
                                                    background: "rgba(0,0,0,0.75)", border: "none",
                                                    color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center",
                                                    cursor: "pointer", transition: "transform 0.15s"
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.15)"}
                                                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                                                title="Watch Demo Video"
                                            >
                                                <PlayCircle size={28} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Featured Info */}
                                    <div style={{ flex: 1, minWidth: 280 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                            <span style={{
                                                background: "rgba(0,194,203,0.12)", color: "#00C2CB",
                                                fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 12,
                                                letterSpacing: "0.06em", textTransform: "uppercase"
                                            }}>
                                                ⭐ Spotlight Course
                                            </span>
                                            {featuredCourse.categoryName && (
                                                <span style={{ fontSize: 12, color: "#aaaaaa" }}>
                                                    {featuredCourse.categoryName}
                                                </span>
                                            )}
                                        </div>

                                        <h3 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800, color: "#ffffff", lineHeight: 1.3 }}>
                                            {featuredCourse.title}
                                        </h3>

                                        <p style={{
                                            margin: "0 0 16px", fontSize: 13, color: "#aaaaaa", lineHeight: 1.6,
                                            display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden"
                                        }}>
                                            {featuredCourse.description || "Master core concepts with hands-on live peer mentoring. Interactive session includes live coding and Q&A."}
                                        </p>

                                        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                                            <span style={{ fontSize: 18, fontWeight: 800, color: "#00C2CB" }}>
                                                {featuredCourse.price === 0 ? "Free" : `₹${featuredCourse.price}`}
                                            </span>

                                            <button
                                                onClick={() => setEnrollingCourse(featuredCourse)}
                                                style={{
                                                    background: "#00C2CB", color: "#0f0f0f",
                                                    border: "none", borderRadius: 20, padding: "8px 20px",
                                                    fontSize: 13, fontWeight: 700, cursor: "pointer",
                                                    transition: "opacity 0.15s"
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
                                                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                                            >
                                                Enroll Now
                                            </button>

                                            {featuredCourse.demoVideoUrl && (
                                                <button
                                                    onClick={() => window.open(featuredCourse.demoVideoUrl, "_blank")}
                                                    style={{
                                                        background: "#242424", color: "#f1f1f1",
                                                        border: "1px solid #383838", borderRadius: 20, padding: "8px 18px",
                                                        fontSize: 13, fontWeight: 600, cursor: "pointer",
                                                        display: "inline-flex", alignItems: "center", gap: 6,
                                                    }}
                                                >
                                                    <PlayCircle size={15} />
                                                    <span>Watch Demo</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Latest Courses Section */}
                            <div style={{ marginBottom: 36 }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#f1f1f1" }}>
                                        Latest Courses
                                    </h2>
                                    {courses.length > 3 && (
                                        <button
                                            onClick={() => setActiveTab("Courses")}
                                            style={{
                                                background: "transparent", border: "none", color: "#00C2CB",
                                                fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4
                                            }}
                                        >
                                            <span>View all ({courses.length})</span>
                                            <ChevronRight size={14} />
                                        </button>
                                    )}
                                </div>

                                {courses.length === 0 ? (
                                    <div style={{ textAlign: "center", padding: "40px 0", color: "#666" }}>
                                        No courses published by this tutor yet.
                                    </div>
                                ) : (
                                    <div style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                                        gap: "20px 16px"
                                    }}>
                                        {courses.slice(0, 4).map(course => (
                                            <TutorCourseItem
                                                key={course.id}
                                                course={course}
                                                onEnroll={() => setEnrollingCourse(course)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Recent Feedback Preview */}
                            {reviews.length > 0 && (
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                                        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#f1f1f1" }}>
                                            Student Reviews
                                        </h2>
                                        <button
                                            onClick={() => setActiveTab("Reviews")}
                                            style={{
                                                background: "transparent", border: "none", color: "#00C2CB",
                                                fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4
                                            }}
                                        >
                                            <span>See all ({reviews.length})</span>
                                            <ChevronRight size={14} />
                                        </button>
                                    </div>

                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
                                        {reviews.slice(0, 2).map((review, i) => (
                                            <ReviewItem key={review.id || i} review={review} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 2: COURSES */}
                    {activeTab === "Courses" && (
                        <div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#f1f1f1" }}>
                                    All Courses ({courses.length})
                                </h2>
                            </div>

                            {courses.length === 0 ? (
                                <div style={{
                                    textAlign: "center", padding: "60px 24px",
                                    background: "#161616", borderRadius: 16, border: "1px solid #272727"
                                }}>
                                    <BookOpen size={36} color="#666" style={{ margin: "0 auto 12px" }} />
                                    <p style={{ margin: 0, color: "#aaaaaa", fontSize: 14 }}>
                                        This tutor hasn't published any courses yet. Check back soon!
                                    </p>
                                </div>
                            ) : (
                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                                    gap: "20px 16px"
                                }}>
                                    {courses.map(course => (
                                        <TutorCourseItem
                                            key={course.id}
                                            course={course}
                                            onEnroll={() => setEnrollingCourse(course)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 3: REVIEWS */}
                    {activeTab === "Reviews" && (
                        <div>
                            {/* Summary Card */}
                            <div style={{
                                background: "#161616", border: "1px solid #272727", borderRadius: 16,
                                padding: "20px 24px", marginBottom: 24, display: "flex", alignItems: "center", gap: 28
                            }}>
                                <div style={{ textAlign: "center", borderRight: "1px solid #272727", paddingRight: 28 }}>
                                    <div style={{ fontSize: 36, fontWeight: 800, color: "#ffffff", lineHeight: 1 }}>
                                        {profile?.avgRating ? Number(profile.avgRating).toFixed(1) : "5.0"}
                                    </div>
                                    <div style={{ display: "flex", gap: 3, margin: "8px 0 4px", justifyContent: "center" }}>
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <Star key={s} size={15} fill="#facc15" color="#facc15" />
                                        ))}
                                    </div>
                                    <span style={{ fontSize: 11, color: "#888", fontWeight: 500 }}>
                                        {reviews.length} total review{reviews.length !== 1 ? "s" : ""}
                                    </span>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: "#f1f1f1" }}>
                                        Student Satisfaction & Feedback
                                    </h3>
                                    <p style={{ margin: 0, fontSize: 13, color: "#aaaaaa", lineHeight: 1.5 }}>
                                        Reviews submitted by verified students after attending live peer tutoring sessions.
                                    </p>
                                </div>
                            </div>

                            {/* Reviews List */}
                            {reviews.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "60px 0", color: "#666" }}>
                                    No reviews yet for this tutor. Be the first to enroll and review!
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                    {reviews.map((review, i) => (
                                        <ReviewItem key={review.id || i} review={review} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 4: ABOUT */}
                    {activeTab === "About" && (
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "2fr 1fr",
                            gap: 32,
                            alignItems: "flex-start"
                        }}>
                            {/* Bio & Details */}
                            <div style={{
                                background: "#161616", border: "1px solid #272727",
                                borderRadius: 18, padding: 24
                            }}>
                                <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 700, color: "#ffffff" }}>
                                    Description & Bio
                                </h3>
                                <p style={{ margin: 0, fontSize: 14, color: "#cccccc", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                                    {profile?.bio || "No detailed biography provided yet."}
                                </p>

                                <div style={{ height: 1, background: "#272727", margin: "24px 0" }} />

                                <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700, color: "#ffffff" }}>
                                    Specialties & Skills
                                </h3>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                    {["Computer Science", "Spring Boot", "Web Development", "Databases", "System Design", "Algorithms"].map(skill => (
                                        <span
                                            key={skill}
                                            style={{
                                                background: "#212121", border: "1px solid #333333",
                                                color: "#e0e0e0", fontSize: 12, fontWeight: 500,
                                                padding: "6px 14px", borderRadius: 16
                                            }}
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Channel Stats Sidebar */}
                            <div style={{
                                background: "#161616", border: "1px solid #272727",
                                borderRadius: 18, padding: 24
                            }}>
                                <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#ffffff" }}>
                                    Stats & Info
                                </h3>

                                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                    <div>
                                        <span style={{ fontSize: 11, color: "#888", fontWeight: 600, textTransform: "uppercase" }}>Joined FLUX</span>
                                        <div style={{ fontSize: 14, color: "#f1f1f1", fontWeight: 500, marginTop: 2 }}>
                                            September 2026
                                        </div>
                                    </div>

                                    <div style={{ height: 1, background: "#272727" }} />

                                    <div>
                                        <span style={{ fontSize: 11, color: "#888", fontWeight: 600, textTransform: "uppercase" }}>Subscribers</span>
                                        <div style={{ fontSize: 14, color: "#f1f1f1", fontWeight: 500, marginTop: 2 }}>
                                            {profile?.subscribersCount || 0} peer students
                                        </div>
                                    </div>

                                    <div style={{ height: 1, background: "#272727" }} />

                                    <div>
                                        <span style={{ fontSize: 11, color: "#888", fontWeight: 600, textTransform: "uppercase" }}>Courses Created</span>
                                        <div style={{ fontSize: 14, color: "#f1f1f1", fontWeight: 500, marginTop: 2 }}>
                                            {courses.length} courses published
                                        </div>
                                    </div>

                                    <div style={{ height: 1, background: "#272727" }} />

                                    <div>
                                        <span style={{ fontSize: 11, color: "#888", fontWeight: 600, textTransform: "uppercase" }}>Location</span>
                                        <div style={{ fontSize: 14, color: "#f1f1f1", fontWeight: 500, marginTop: 2 }}>
                                            Campus / Online Live
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Enrollment Modal ── */}
            {enrollingCourse && (
                <EnrollmentModal
                    course={enrollingCourse}
                    onClose={() => setEnrollingCourse(null)}
                    onConfirm={handleConfirmEnrollment}
                />
            )}

            {/* ── Edit Profile Modal (YouTube Dark Theme) ── */}
            {isEditing && (
                <div style={{
                    position: "fixed", inset: 0, zIndex: 100,
                    background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)",
                    display: "flex", alignItems: "center", justifyContent: "center", padding: 16
                }}>
                    <div style={{
                        background: "#1c1c1c", border: "1px solid #383838", borderRadius: 20,
                        width: "100%", maxWidth: 480, overflow: "hidden",
                        boxShadow: "0 24px 60px rgba(0,0,0,0.85)"
                    }}>
                        {/* Modal Header */}
                        <div style={{
                            padding: "16px 20px", background: "#151515", borderBottom: "1px solid #2a2a2a",
                            display: "flex", justifyContent: "space-between", alignItems: "center"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <Edit3 size={18} color="#00C2CB" />
                                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#f1f1f1", textTransform: "uppercase" }}>
                                    Edit Channel Profile
                                </h3>
                            </div>
                            <button
                                onClick={() => setIsEditing(false)}
                                style={{ background: "transparent", border: "none", color: "#aaa", cursor: "pointer", padding: 4 }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSaveProfile} style={{ padding: 20 }}>
                            {/* Avatar Upload */}
                            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
                                <div style={{
                                    width: 60, height: 60, borderRadius: "50%",
                                    background: "#242424", border: "2px solid #333333",
                                    overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center"
                                }}>
                                    {editForm.avatarUrl ? (
                                        <img src={editForm.avatarUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    ) : (
                                        <span style={{ fontSize: 20, fontWeight: 700, color: "#00C2CB" }}>{avatarInitial}</span>
                                    )}
                                </div>
                                <div>
                                    <label style={{
                                        display: "inline-block", background: "#272727", border: "1px solid #3f3f3f",
                                        borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, color: "#f1f1f1",
                                        cursor: "pointer"
                                    }}>
                                        {uploading ? "Uploading..." : "Upload New Photo"}
                                        <input type="file" style={{ display: "none" }} onChange={handleAvatarUpload} accept="image/*" disabled={uploading} />
                                    </label>
                                    <p style={{ margin: "4px 0 0", fontSize: 11, color: "#888" }}>Recommended: Square JPG or PNG</p>
                                </div>
                            </div>

                            {/* Name */}
                            <div style={{ marginBottom: 14 }}>
                                <label style={{ display: "block", fontSize: 11, color: "#888", fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.name}
                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                    style={{
                                        width: "100%", background: "#121212", border: "1px solid #333333",
                                        borderRadius: 10, padding: "10px 12px", color: "#f1f1f1", fontSize: 13,
                                        outline: "none", boxSizing: "border-box"
                                    }}
                                />
                            </div>

                            {/* Field of Study */}
                            <div style={{ marginBottom: 14 }}>
                                <label style={{ display: "block", fontSize: 11, color: "#888", fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>
                                    Field of Study / Tagline
                                </label>
                                <input
                                    type="text"
                                    value={editForm.fieldOfStudy}
                                    onChange={e => setEditForm({ ...editForm, fieldOfStudy: e.target.value })}
                                    placeholder="e.g. Computer Science & Cloud Architecture"
                                    style={{
                                        width: "100%", background: "#121212", border: "1px solid #333333",
                                        borderRadius: 10, padding: "10px 12px", color: "#f1f1f1", fontSize: 13,
                                        outline: "none", boxSizing: "border-box"
                                    }}
                                />
                            </div>

                            {/* Bio */}
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: "block", fontSize: 11, color: "#888", fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>
                                    Bio & Experience
                                </label>
                                <textarea
                                    rows="4"
                                    value={editForm.bio}
                                    onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                                    placeholder="Share your mentoring approach, background, and what students will learn..."
                                    style={{
                                        width: "100%", background: "#121212", border: "1px solid #333333",
                                        borderRadius: 10, padding: "10px 12px", color: "#f1f1f1", fontSize: 13,
                                        outline: "none", boxSizing: "border-box", fontFamily: "Roboto, Inter, sans-serif"
                                    }}
                                />
                            </div>

                            {/* Buttons */}
                            <div style={{ display: "flex", gap: 10 }}>
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    style={{
                                        flex: 1, padding: "10px 0", borderRadius: 10,
                                        background: "#242424", border: "1px solid #383838",
                                        color: "#aaa", fontSize: 13, fontWeight: 600, cursor: "pointer"
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        flex: 1, padding: "10px 0", borderRadius: 10,
                                        background: "#00C2CB", border: "none",
                                        color: "#0f0f0f", fontSize: 13, fontWeight: 700, cursor: "pointer"
                                    }}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ── YouTube-Style Course Item Component ── */
function TutorCourseItem({ course, onEnroll }) {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={onEnroll}
            style={{
                display: "flex",
                flexDirection: "column",
                borderRadius: 16,
                padding: 10,
                background: hovered ? "#212121" : "transparent",
                border: hovered ? "1px solid #333333" : "1px solid transparent",
                cursor: "pointer",
                transition: "background 0.2s ease, border-color 0.2s ease, transform 0.2s ease",
                transform: hovered ? "translateY(-2px)" : "none",
            }}
        >
            {/* 16:9 Thumbnail */}
            <div style={{
                position: "relative",
                width: "100%",
                paddingTop: "56.25%",
                borderRadius: 12,
                overflow: "hidden",
                background: "#1c1c1c",
                marginBottom: 10,
                flexShrink: 0
            }}>
                {course.thumbnailUrl ? (
                    <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        style={{
                            position: "absolute", inset: 0, width: "100%", height: "100%",
                            objectFit: "cover", transform: hovered ? "scale(1.03)" : "scale(1)",
                            transition: "transform 0.4s ease"
                        }}
                    />
                ) : (
                    <div style={{
                        position: "absolute", inset: 0, display: "flex", alignItems: "center",
                        justifyContent: "center", color: "#666", fontSize: 11, fontWeight: 600,
                        textTransform: "uppercase"
                    }}>
                        No Preview
                    </div>
                )}

                {course.categoryName && (
                    <span style={{
                        position: "absolute", bottom: 8, left: 8,
                        background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)",
                        color: "#f1f1f1", fontSize: 11, fontWeight: 600,
                        padding: "3px 8px", borderRadius: 4,
                    }}>
                        {course.categoryName}
                    </span>
                )}

                {course.demoVideoUrl && (
                    <button
                        onClick={e => { e.stopPropagation(); window.open(course.demoVideoUrl, "_blank"); }}
                        style={{
                            position: "absolute", bottom: 8, right: 8,
                            background: "rgba(0,0,0,0.75)", border: "none",
                            borderRadius: "50%", width: 30, height: 30,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", color: "#f1f1f1",
                        }}
                        title="Watch Demo"
                    >
                        <PlayCircle size={17} />
                    </button>
                )}
            </div>

            {/* Course Title */}
            <h3 style={{
                margin: "0 0 4px", fontSize: 14, fontWeight: 600,
                color: hovered ? "#00C2CB" : "#f1f1f1",
                lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical", overflow: "hidden", transition: "color 0.15s"
            }}>
                {course.title}
            </h3>

            {/* Pricing + Enroll Action */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#00C2CB" }}>
                    {course.price === 0 ? "Free" : `₹${course.price}`}
                </span>

                <button
                    onClick={e => { e.stopPropagation(); onEnroll(); }}
                    style={{
                        background: hovered ? "#00C2CB" : "#272727",
                        color: hovered ? "#0f0f0f" : "#f1f1f1",
                        border: "none", borderRadius: 6,
                        padding: "5px 12px", fontSize: 12, fontWeight: 600,
                        cursor: "pointer", transition: "background 0.15s ease, color 0.15s ease"
                    }}
                >
                    Enroll
                </button>
            </div>
        </div>
    );
}

/* ── YouTube-Style Review Item Component ── */
function ReviewItem({ review }) {
    const studentName = review.booking?.student?.name || "Student Peer";
    const initial = studentName.charAt(0).toUpperCase();
    const date = review.createdAt ? new Date(review.createdAt).toLocaleDateString(undefined, {
        month: "short", day: "numeric", year: "numeric"
    }) : "Recent";

    return (
        <div style={{
            background: "#161616", border: "1px solid #272727", borderRadius: 14,
            padding: "16px 18px", display: "flex", gap: 14
        }}>
            {/* Student Avatar */}
            <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "#2a2a2a", border: "1px solid #3f3f3f",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#00C2CB", fontWeight: 700, fontSize: 13, flexShrink: 0
            }}>
                {initial}
            </div>

            <div style={{ flex: 1 }}>
                {/* Header Row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#f1f1f1" }}>
                            {studentName}
                        </span>
                        <span style={{ fontSize: 11, color: "#777" }}>•</span>
                        <span style={{ fontSize: 11, color: "#888" }}>{date}</span>
                    </div>

                    <div style={{ display: "flex", gap: 2 }}>
                        {[1, 2, 3, 4, 5].map(s => (
                            <Star
                                key={s}
                                size={13}
                                fill={s <= (review.rating || 5) ? "#facc15" : "#333333"}
                                color={s <= (review.rating || 5) ? "#facc15" : "#333333"}
                            />
                        ))}
                    </div>
                </div>

                {/* Course Name */}
                {review.booking?.course?.title && (
                    <div style={{ fontSize: 11, color: "#00C2CB", fontWeight: 500, marginBottom: 6 }}>
                        Course: {review.booking.course.title}
                    </div>
                )}

                {/* Comment Text */}
                <p style={{ margin: 0, fontSize: 13, color: "#cccccc", lineHeight: 1.5 }}>
                    "{review.comment || "Great interactive session! The explanations were clear and straightforward."}"
                </p>
            </div>
        </div>
    );
}
