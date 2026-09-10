import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import { toast } from "react-hot-toast";
import { ArrowLeft, Edit2, Check, Plus, Star, ChevronRight, Calendar } from "lucide-react";

const injectStyles = () => {
    if (document.getElementById("up-styles")) return;
    const style = document.createElement("style");
    style.id = "up-styles";
    style.textContent = `
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap");
        .up-root { font-family: "Inter", sans-serif; }

        /* ── Rich mesh banner ───────────────────────────────────── */
        .up-banner {
            height: 220px; width: 100%;
            border-radius: 1.5rem 1.5rem 0 0;
            background:
                radial-gradient(ellipse 80% 80% at 10% 120%, #6366f1 0%, transparent 55%),
                radial-gradient(ellipse 60% 80% at 90%  -20%, #a78bfa 0%, transparent 60%),
                radial-gradient(ellipse 70% 60% at 60%  110%, #38bdf8 0%, transparent 50%),
                linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #1e3a5f 100%);
            position: relative; overflow: hidden;
        }
        /* Animated glowing orbs */
        .up-banner::before {
            content: ""; position: absolute;
            width: 320px; height: 320px; border-radius: 50%;
            background: radial-gradient(circle, rgba(167,139,250,0.45) 0%, transparent 70%);
            top: -80px; left: -60px;
            animation: up-orb1 8s ease-in-out infinite alternate;
        }
        .up-banner::after {
            content: ""; position: absolute;
            width: 280px; height: 280px; border-radius: 50%;
            background: radial-gradient(circle, rgba(56,189,248,0.35) 0%, transparent 70%);
            bottom: -100px; right: -40px;
            animation: up-orb2 10s ease-in-out infinite alternate;
        }
        @keyframes up-orb1 {
            from { transform: translate(0,0) scale(1); }
            to   { transform: translate(40px, 30px) scale(1.15); }
        }
        @keyframes up-orb2 {
            from { transform: translate(0,0) scale(1); }
            to   { transform: translate(-30px, -20px) scale(1.2); }
        }
        /* Dot-grid overlay for texture */
        .up-banner-dots {
            position: absolute; inset: 0; pointer-events: none;
            background-image: radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px);
            background-size: 22px 22px;
        }
        /* Shimmer sweep */
        .up-banner-sweep {
            position: absolute; inset: 0; pointer-events: none;
            background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.07) 50%, transparent 60%);
            animation: up-sweep 4s ease-in-out infinite;
        }
        @keyframes up-sweep {
            0%   { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
        }
        .up-avatar-squircle {
            width: 200px; height: 200px; border-radius: 2rem;
            border: 5px solid #fff; box-shadow: 0 8px 32px rgba(0,0,0,0.15);
            object-fit: cover; background: #f8fafc; overflow: hidden;
        }
        .up-tab-active { color: #0f172a; font-weight: 700; border-bottom: 2.5px solid #0f172a; padding-bottom: 10px; }
        .up-tab-inactive { color: #94a3b8; padding-bottom: 10px; transition: color 0.15s; }
        .up-tab-inactive:hover { color: #475569; }
        /* Floating card — transparent wrapper, image is its own block */
        .up-card {
            background: transparent; border: none;
            display: flex; flex-direction: column;
            cursor: pointer;
        }
        /* Standalone thumbnail block */
        .up-card-thumb-block {
            width: 100%; border-radius: 1.25rem; overflow: hidden;
            position: relative; flex-shrink: 0;
            transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .up-card:hover .up-card-thumb-block {
            transform: translateY(-3px);
            box-shadow: 0 12px 32px rgba(99,102,241,0.18);
        }
        .up-card-thumb-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.4s ease; }
        .up-card:hover .up-card-thumb-img { transform: scale(1.03); }
        .up-price { color: #00C2CB; font-weight: 700; font-size: 1.125rem; }
        .up-btn-subscribe {
            background: #FF7A59; color: #fff; border: none;
            border-radius: 999px; padding: 10px 24px; font-weight: 600; font-size: 14px;
            cursor: pointer; transition: background 0.15s, transform 0.1s; display: inline-flex; align-items: center; gap: 6px;
        }
        .up-btn-subscribe:hover { background: #FF623D; }
        .up-btn-subscribe:active { transform: scale(0.97); }
        .up-btn-subscribed {
            background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0;
            border-radius: 999px; padding: 10px 24px; font-weight: 600; font-size: 14px;
            cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
        }
        .up-btn-edit {
            background: #fff; color: #334155; border: 1px solid #e2e8f0;
            border-radius: 999px; padding: 10px 24px; font-weight: 600; font-size: 14px;
            cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
            transition: background 0.15s;
        }
        .up-btn-edit:hover { background: #f8fafc; }
        .up-review-card {
            background: #fff; border-radius: 1rem; border: 1px solid #f1f5f9;
            padding: 1.25rem; display: flex; flex-direction: column; gap: 8px;
        }
        .up-input {
            width: 100%; padding: 10px 14px; background: #f8fafc;
            border: 1px solid #e2e8f0; border-radius: 10px; color: #1e293b;
            font-size: 14px; outline: none; font-family: "Inter", sans-serif; box-sizing: border-box;
        }
        .up-input:focus { border-color: #818cf8; box-shadow: 0 0 0 3px rgba(129,140,248,0.15); }
        @keyframes shimmer {
            0% { background-position: -400px 0; }
            100% { background-position: 400px 0; }
        }
        .up-shimmer {
            background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
            background-size: 800px 100%; animation: shimmer 1.5s infinite;
        }
    `;
    document.head.appendChild(style);
};

function StarRating({ rating }) {
    return (
        <span style={{ display: "inline-flex", gap: 2 }}>
            {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} size={14} style={{ fill: i <= rating ? "#FBBF24" : "none", color: i <= rating ? "#FBBF24" : "#CBD5E1" }} />
            ))}
        </span>
    );
}

// Portfolia-style card palette
const PASTEL_PALETTE = [
    { bg: "#E8EEF8", hover: "#D8E4F5" }, // blue-grey (matches reference exactly)
    { bg: "#E8F2EC", hover: "#D5EAE0" }, // soft green
    { bg: "#F5EDE8", hover: "#EDE0D8" }, // warm peach
    { bg: "#EDE8F5", hover: "#E0D8EF" }, // soft lavender
    { bg: "#E8F5F5", hover: "#D8EDEE" }, // soft teal
];

// Category badge colors cycling (like the "UI", "Br" orbs in reference)
const BADGE_COLORS = ["#6366f1", "#f97316", "#10b981", "#8b5cf6", "#ec4899", "#06b6d4"];

function CourseCard({ course, index = 0 }) {
    const { bg, hover } = PASTEL_PALETTE[index % PASTEL_PALETTE.length];
    const badgeColor = BADGE_COLORS[index % BADGE_COLORS.length];
    const [hovered, setHovered] = useState(false);
    // Short 2-letter abbreviation for the category badge
    const catAbbr = course.categoryName
        ? course.categoryName.slice(0, 2).toUpperCase()
        : null;
    return (
        <Link
            to={`/discover`}
            state={{ courseId: course.id }}
            style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column" }}
        >
        <div
            className="up-card"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* ── 1. Pastel image box — image fills flush, no inner border ── */}
            <div style={{
                position: "relative",
                width: "100%",
                aspectRatio: "4/3",
                borderRadius: "1.5rem",
                overflow: "hidden",      /* image clips to the rounded box */
                background: hovered ? hover : bg,
                transition: "background 0.3s ease",
                marginBottom: 14,
            }}>
                {course.thumbnailUrl ? (
                    <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        style={{
                            width: "100%", height: "100%",
                            objectFit: "cover", display: "block",
                            transform: hovered ? "scale(1.04)" : "scale(1)",
                            transition: "transform 0.4s ease",
                        }}
                    />
                ) : (
                    <div style={{
                        width: "100%", height: "100%",
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                        gap: 8, color: "#94a3b8",
                    }}>
                        <span style={{ fontSize: 36 }}>🎓</span>
                        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>No Preview</span>
                    </div>
                )}
            </div>

            {/* ── 2. Floating text — title + price, subtitle ── */}
            <div style={{ padding: "0 4px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <h3 style={{
                        margin: 0, flex: 1,
                        fontSize: 15, fontWeight: 700, color: "#0f172a",
                        lineHeight: 1.35,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                        {course.title}
                    </h3>
                    <span style={{ flexShrink: 0, fontSize: 14, fontWeight: 700, color: "#00C2CB", whiteSpace: "nowrap" }}>
                        {course.price === 0 ? "Free" : `₹${course.price}`}
                    </span>
                </div>

                <p style={{
                    margin: "4px 0 0", fontSize: 12, color: "#94a3b8", fontWeight: 500,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                    {[course.categoryName, course.slots && course.slots.length > 0
                        ? new Date(course.slots[0].startTime).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                        : null
                    ].filter(Boolean).join(" · ") || "View available slots"}
                </p>
            </div>
        </div>
        </Link>
    );
}




function ReviewCard({ review }) {
    const student = review.booking?.student;
    const name = student?.name || "Anonymous";
    const initial = name.charAt(0).toUpperCase();
    const date = review.createdAt ? new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
    return (
        <div className="up-review-card">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0
                }}>{initial}</div>
                <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{name}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>{date}</p>
                </div>
                <div style={{ marginLeft: "auto" }}><StarRating rating={review.rating} /></div>
            </div>
            {review.comment && (
                <p style={{ margin: 0, fontSize: 13, color: "#475569", lineHeight: 1.6 }}>"{review.comment}"</p>
            )}
        </div>
    );
}

export default function UserProfile() {
    injectStyles();
    const { id } = useParams();
    const { user, login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [courses, setCourses] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscribing, setSubscribing] = useState(false);
    const [activeTab, setActiveTab] = useState("Courses");
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: "", fieldOfStudy: "", bio: "", avatarUrl: "" });
    const [uploading, setUploading] = useState(false);
    const isOwnProfile = user?.id === parseInt(id);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get(`/users/public/${id}`);
                setProfile(res.data);
                if (isOwnProfile) {
                    setEditForm({ name: res.data.name || "", fieldOfStudy: res.data.fieldOfStudy || "", bio: res.data.bio || "", avatarUrl: res.data.avatarUrl || "" });
                }
                if (!isOwnProfile && user?.id) {
                    const subRes = await api.get(`/subscriptions/check/student/${user.id}/tutor/${id}`);
                    setIsSubscribed(subRes.data.subscribed);
                }
                const [coursesRes, reviewsRes] = await Promise.all([
                    api.get(`/courses/user/${id}`),
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
        if (!user) { toast.error("Please log in to subscribe."); navigate("/login"); return; }
        setSubscribing(true);
        try {
            const res = await api.post(`/subscriptions/student/${user.id}/tutor/${id}`);
            setIsSubscribed(res.data.subscribed);
            setProfile(prev => ({ ...prev, subscribersCount: prev.subscribersCount + (res.data.subscribed ? 1 : -1) }));
            toast.success(res.data.subscribed ? "Subscribed!" : "Unsubscribed.");
        } catch { toast.error("Subscription failed."); } finally { setSubscribing(false); }
    };

    const handleSaveProfile = async () => {
        try {
            const res = await api.put("/users/me", { fullName: editForm.name, fieldOfStudy: editForm.fieldOfStudy, bio: editForm.bio, avatarUrl: editForm.avatarUrl });
            setProfile(prev => ({ ...prev, name: res.data.name, fieldOfStudy: res.data.fieldOfStudy, bio: res.data.bio, avatarUrl: res.data.profileImage }));
            login(res.data, localStorage.getItem("token"));
            setIsEditing(false);
            toast.success("Profile updated!");
        } catch { toast.error("Failed to update profile."); }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0]; if (!file) return;
        const formData = new FormData(); formData.append("file", file);
        setUploading(true);
        try {
            const res = await api.post("/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
            setEditForm(prev => ({ ...prev, avatarUrl: res.data.url }));
            toast.success("Image uploaded!");
        } catch { toast.error("Upload failed."); } finally { setUploading(false); }
    };

    if (loading) {
        return (
            <div className="up-root" style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px" }}>
                <div className="up-shimmer" style={{ height: 192, borderRadius: "1.5rem 1.5rem 0 0" }} />
                <div style={{ background: "#fff", borderRadius: "0 0 1.5rem 1.5rem", padding: "20px 32px 32px" }}>
                    <div className="up-shimmer" style={{ width: 112, height: 112, borderRadius: "1.5rem", marginTop: -56 }} />
                    <div className="up-shimmer" style={{ width: 200, height: 28, borderRadius: 8, marginTop: 16 }} />
                    <div className="up-shimmer" style={{ width: 140, height: 16, borderRadius: 6, marginTop: 10 }} />
                </div>
            </div>
        );
    }

    const avatarSrc = isEditing ? editForm.avatarUrl : profile?.avatarUrl;
    const avatarInitial = (isEditing ? editForm.name : profile?.name)?.charAt(0).toUpperCase() || "?";
    const tabs = ["Courses", "Reviews", "About"];

    return (
        <div className="up-root" style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px 64px" }}>
            <button onClick={() => navigate(-1)} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#64748b", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 14px", cursor: "pointer", marginBottom: 20 }}>
                <ArrowLeft size={15} /> Back
            </button>

            <div style={{ background: "#fff", borderRadius: "1.5rem", boxShadow: "0 2px 24px rgba(0,0,0,0.06)", overflow: "hidden" }}>
                <div className="up-banner">
                    <div className="up-banner-dots" />
                    <div className="up-banner-sweep" />
                </div>

                <div style={{ padding: "0 32px 24px" }}>
                    {/* Avatar row: avatar left, stats right */}
                    <div style={{ position: "relative", marginTop: -100, marginBottom: 16, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>

                        {/* Left: squircle avatar */}
                        <div style={{ position: "relative", flexShrink: 0 }}>
                            <div className="up-avatar-squircle" style={{ display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                                {avatarSrc ? (
                                    <img src={avatarSrc} alt={profile?.name} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: isEditing ? 0.5 : 1 }} />
                                ) : (
                                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#818cf8,#a78bfa)", color: "#fff", fontSize: 64, fontWeight: 800 }}>{avatarInitial}</div>
                                )}
                            </div>
                            {isEditing && (
                                <label style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)", borderRadius: "2rem", cursor: "pointer", color: "#fff", fontSize: 13, fontWeight: 600, textAlign: "center" }}>
                                    {uploading ? "Uploading..." : "📷 Change"}
                                    <input type="file" style={{ display: "none" }} onChange={handleAvatarUpload} accept="image/*" disabled={uploading} />
                                </label>
                            )}
                        </div>

                        {/* Right: Stats — shifted down to clear the larger avatar */}
                        {!isEditing && (
                            <div style={{ display: "flex", gap: 44, marginTop: 108, paddingRight: 4 }}>
                                {[
                                    { label: "Subscribers", value: profile?.subscribersCount ?? 0 },
                                    { label: "Courses",     value: profile?.coursesCount ?? 0 },
                                    { label: "Avg Rating",  value: profile?.avgRating ? Number(profile.avgRating).toFixed(1) : "—" },
                                ].map(stat => (
                                    <div key={stat.label} style={{ textAlign: "center" }}>
                                        <p style={{ margin: 0, fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>{stat.label}</p>
                                        <p style={{ margin: 0, fontSize: 44, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{stat.value}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                        {isEditing ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 480, marginBottom: 16 }}>
                                <input className="up-input" type="text" placeholder="Your name" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} style={{ fontSize: 18, fontWeight: 700 }} />
                                <input className="up-input" type="text" placeholder="Field of study or headline" value={editForm.fieldOfStudy} onChange={e => setEditForm({ ...editForm, fieldOfStudy: e.target.value })} />
                                <textarea className="up-input" placeholder="Write a short bio..." value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} rows={3} style={{ resize: "vertical" }} />
                            </div>
                        ) : (
                            <>
                                <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#0f172a" }}>{profile?.name}</h1>
                                <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>{profile?.fieldOfStudy || "PeerTutor Member"}</p>
                            </>
                        )}

                        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                            {isOwnProfile ? (
                                isEditing ? (
                                    <>
                                        <button onClick={() => setIsEditing(false)} className="up-btn-edit">Cancel</button>
                                        <button onClick={handleSaveProfile} className="up-btn-subscribe">Save Profile</button>
                                    </>
                                ) : (
                                    <button onClick={() => setIsEditing(true)} className="up-btn-edit"><Edit2 size={14} /> Edit Profile</button>
                                )
                            ) : (
                                <button onClick={handleSubscribe} disabled={subscribing} className={isSubscribed ? "up-btn-subscribed" : "up-btn-subscribe"}>
                                    {isSubscribed ? <><Check size={15} /> Subscribed</> : <><Plus size={15} /> Subscribe</>}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ borderTop: "1px solid #f1f5f9", padding: "0 32px", display: "flex", gap: 28 }}>
                    {tabs.map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: "14px 0", fontFamily: "Inter, sans-serif" }}
                            className={activeTab === tab ? "up-tab-active" : "up-tab-inactive"}>
                            {tab}
                            {tab === "Courses" && courses.length > 0 && <span style={{ marginLeft: 6, background: "#6366f1", color: "#fff", borderRadius: 999, fontSize: 10, fontWeight: 700, padding: "1px 6px", verticalAlign: "middle" }}>{courses.length}</span>}
                            {tab === "Reviews" && reviews.length > 0 && <span style={{ marginLeft: 6, background: "#f59e0b", color: "#fff", borderRadius: 999, fontSize: 10, fontWeight: 700, padding: "1px 6px", verticalAlign: "middle" }}>{reviews.length}</span>}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ padding: "28px 0" }}>
                {activeTab === "Courses" && (
                    courses.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "56px 0", background: "#fff", borderRadius: "1.25rem", border: "1.5px dashed #e2e8f0", color: "#94a3b8", fontSize: 14 }}>
                            No courses published yet.
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "24px 20px" }}>
                            {courses.map((course, i) => <CourseCard key={course.id} course={course} index={i} />)}
                        </div>
                    )
                )}

                {activeTab === "Reviews" && (
                    reviews.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "56px 0", background: "#fff", borderRadius: "1.25rem", border: "1.5px dashed #e2e8f0", color: "#94a3b8", fontSize: 14 }}>
                            No reviews yet.
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid #f1f5f9", padding: "16px 24px", display: "flex", alignItems: "center", gap: 16, marginBottom: 4 }}>
                                <span style={{ fontSize: 40, fontWeight: 800, color: "#0f172a" }}>{profile?.avgRating ? Number(profile.avgRating).toFixed(1) : "—"}</span>
                                <div>
                                    <StarRating rating={Math.round(profile?.avgRating || 0)} />
                                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8" }}>{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
                                </div>
                            </div>
                            {reviews.map(review => <ReviewCard key={review.id} review={review} />)}
                        </div>
                    )
                )}

                {activeTab === "About" && (
                    <div style={{ background: "#fff", borderRadius: "1.25rem", border: "1px solid #f1f5f9", padding: "28px 32px" }}>
                        <h2 style={{ margin: "0 0 12px", fontSize: 18, fontWeight: 700, color: "#0f172a" }}>About {profile?.name?.split(" ")[0]}</h2>
                        <p style={{ margin: 0, fontSize: 15, color: "#475569", lineHeight: 1.75 }}>{profile?.bio || "This user has not written a bio yet."}</p>
                        {profile?.fieldOfStudy && (
                            <div style={{ marginTop: 20 }}>
                                <span style={{ background: "#ede9fe", color: "#7c3aed", borderRadius: 8, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>🎓 {profile.fieldOfStudy}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
