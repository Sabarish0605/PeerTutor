import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import EnrollmentModal from '../components/EnrollmentModal';
import { 
    Users, Clock, PlayCircle, PlusCircle, CheckCircle2, 
    Sparkles, ArrowRight, Compass, Filter
} from 'lucide-react';

export default function Subscriptions() {
    const { user } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTutorId, setSelectedTutorId] = useState(null); // null = All
    const [enrollingCourse, setEnrollingCourse] = useState(null);

    const fetchSubscribedCourses = async () => {
        try {
            const res = await api.get('/courses/subscriptions');
            setCourses(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Failed to fetch subscriptions feed", error);
            toast.error("Failed to load your subscriptions feed.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) {
            fetchSubscribedCourses();
        }
    }, [user]);

    // Extract unique tutors for the top channels bar
    const tutors = Array.from(
        new Map(
            courses
                .filter(c => c.tutorId)
                .map(c => [c.tutorId, {
                    id: c.tutorId,
                    name: c.tutorName || 'Tutor',
                    avatar: c.authorAvatar,
                }])
        ).values()
    );

    const filteredCourses = selectedTutorId
        ? courses.filter(c => c.tutorId === selectedTutorId)
        : courses;

    const handleEnrollClick = (course) => {
        if (!user?.id) {
            toast.error("Please log in to enroll.");
            return;
        }
        setEnrollingCourse(course);
    };

    const handleConfirmEnrollment = async (slotId) => {
        if (!enrollingCourse) return;
        const courseId = enrollingCourse.id;
        setEnrollingCourse(null);
        toast.loading("Processing Mock Payment...", { id: "payment" });
        setTimeout(async () => {
            try {
                await api.post(`/bookings/student/${user.id}/course/${courseId}/slot/${slotId}`);
                toast.success("Enrolled successfully!", { id: "payment" });
                fetchSubscribedCourses();
            } catch (err) {
                toast.error(err.response?.data?.message || 'Enrollment failed.', { id: "payment" });
            }
        }, 1500);
    };

    const slotStats = (course) => {
        if (!course.slots?.length) return { totalSlots: 0, seatsLeft: 0 };
        return {
            totalSlots: course.slots.length,
            seatsLeft: course.slots.reduce((s, sl) => s + Math.max(0, (sl.maxSeats || 0) - (sl.currentEnrolled || 0)), 0),
        };
    };

    if (loading) {
        return (
            <div style={{
                background: '#0f0f0f', minHeight: '100vh',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#aaaaaa', fontSize: 14, fontFamily: 'Roboto, Inter, sans-serif',
            }}>
                Loading your subscriptions feed...
            </div>
        );
    }

    return (
        <div style={{
            background: '#0f0f0f',
            minHeight: '100vh',
            color: '#f1f1f1',
            fontFamily: 'Roboto, Inter, sans-serif',
            padding: '24px 28px 80px',
        }}>
            {/* ── Header: "Latest" + "Discover Tutors" pill ── */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
            }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#f1f1f1', letterSpacing: '-0.3px' }}>
                        Latest
                    </h1>
                    <p style={{ fontSize: 13, color: '#aaaaaa', margin: '4px 0 0' }}>
                        Fresh courses and upcoming sessions from creators you follow
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Link
                        to="/discover"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            background: '#272727',
                            border: '1px solid #383838',
                            color: '#f1f1f1',
                            borderRadius: 20,
                            padding: '8px 16px',
                            fontSize: 13,
                            fontWeight: 500,
                            textDecoration: 'none',
                            transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#383838'}
                        onMouseLeave={e => e.currentTarget.style.background = '#272727'}
                    >
                        <Compass size={14} color="#00C2CB" />
                        <span>Discover Tutors</span>
                    </Link>
                </div>
            </div>

            {/* ── Subscribed Creators Channels Strip (YouTube style avatar bar) ── */}
            {tutors.length > 0 && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    overflowX: 'auto',
                    scrollbarWidth: 'none',
                    padding: '8px 0 20px',
                    borderBottom: '1px solid #222222',
                    marginBottom: 24,
                }}>
                    {/* "All" button */}
                    <button
                        onClick={() => setSelectedTutorId(null)}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 6,
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            flexShrink: 0,
                        }}
                    >
                        <div style={{
                            width: 52,
                            height: 52,
                            borderRadius: '50%',
                            background: selectedTutorId === null ? '#00C2CB' : '#272727',
                            color: selectedTutorId === null ? '#0f0f0f' : '#f1f1f1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: 13,
                            border: selectedTutorId === null ? '2px solid #00C2CB' : '2px solid #383838',
                            transition: 'transform 0.15s, background 0.15s',
                        }}>
                            All
                        </div>
                        <span style={{
                            fontSize: 11,
                            color: selectedTutorId === null ? '#00C2CB' : '#aaaaaa',
                            fontWeight: selectedTutorId === null ? 600 : 400,
                        }}>
                            All Tutors
                        </span>
                    </button>

                    {/* Tutor avatars */}
                    {tutors.map(tutor => {
                        const isSelected = selectedTutorId === tutor.id;
                        return (
                            <button
                                key={tutor.id}
                                onClick={() => setSelectedTutorId(isSelected ? null : tutor.id)}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 6,
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    flexShrink: 0,
                                }}
                            >
                                <div style={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    border: isSelected ? '2px solid #00C2CB' : '2px solid #333333',
                                    boxShadow: isSelected ? '0 0 12px rgba(0,194,203,0.3)' : 'none',
                                    background: '#222222',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'transform 0.15s, border-color 0.15s',
                                }}>
                                    {tutor.avatar ? (
                                        <img src={tutor.avatar} alt={tutor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <span style={{ fontSize: 16, fontWeight: 700, color: '#00C2CB' }}>
                                            {tutor.name.charAt(0)}
                                        </span>
                                    )}
                                </div>
                                <span style={{
                                    fontSize: 11,
                                    maxWidth: 72,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    color: isSelected ? '#00C2CB' : '#aaaaaa',
                                    fontWeight: isSelected ? 600 : 400,
                                }}>
                                    {tutor.name}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* ── Courses Grid or Sleek YouTube Dark Empty State ── */}
            {filteredCourses.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '80px 24px',
                    background: '#161616',
                    borderRadius: 24,
                    border: '1px solid #272727',
                    maxWidth: 640,
                    margin: '40px auto 0',
                    boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
                }}>
                    <div style={{
                        width: 72,
                        height: 72,
                        borderRadius: '50%',
                        background: 'rgba(0,194,203,0.1)',
                        border: '1px solid rgba(0,194,203,0.2)',
                        color: '#00C2CB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px',
                    }}>
                        <Users size={32} />
                    </div>

                    <h2 style={{ fontSize: 20, fontWeight: 700, color: '#f1f1f1', margin: '0 0 8px' }}>
                        {selectedTutorId ? "No active courses from this tutor yet" : "Don't miss new courses"}
                    </h2>
                    <p style={{
                        fontSize: 13,
                        color: '#aaaaaa',
                        maxWidth: 440,
                        margin: '0 auto 24px',
                        lineHeight: 1.6,
                    }}>
                        {selectedTutorId 
                            ? "This tutor hasn't published any new course slots yet. Check back soon or browse other instructors."
                            : "Subscribe to your favorite peer tutors to see their latest scheduled classes, curriculum updates, and newly posted slots right here."}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                        {selectedTutorId && (
                            <button
                                onClick={() => setSelectedTutorId(null)}
                                style={{
                                    background: '#272727',
                                    border: '1px solid #383838',
                                    color: '#f1f1f1',
                                    borderRadius: 20,
                                    padding: '10px 20px',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                Show All Subscriptions
                            </button>
                        )}
                        <Link
                            to="/discover"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                                background: '#00C2CB',
                                color: '#0f0f0f',
                                borderRadius: 20,
                                padding: '10px 24px',
                                fontSize: 13,
                                fontWeight: 700,
                                textDecoration: 'none',
                                transition: 'opacity 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        >
                            <span>Explore Discover</span>
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
                    gap: '20px 16px',
                }}>
                    {filteredCourses.map(course => {
                        const { totalSlots, seatsLeft } = slotStats(course);
                        return (
                            <SubscriptionCourseCard
                                key={course.id}
                                course={course}
                                totalSlots={totalSlots}
                                seatsLeft={seatsLeft}
                                onEnroll={handleEnrollClick}
                            />
                        );
                    })}
                </div>
            )}

            {/* Session Enrollment Modal */}
            {enrollingCourse && (
                <EnrollmentModal
                    course={enrollingCourse}
                    onClose={() => setEnrollingCourse(null)}
                    onConfirm={handleConfirmEnrollment}
                />
            )}
        </div>
    );
}

/* ── YouTube-Style Subscription Course Card with Highlight Hover ── */
function SubscriptionCourseCard({ course, totalSlots, seatsLeft, onEnroll }) {
    const [hovered, setHovered] = useState(false);
    const noSeats = totalSlots === 0 || seatsLeft === 0;

    return (
        <div
            onClick={() => onEnroll(course)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                borderRadius: 16,
                padding: '10px',
                background: hovered ? '#212121' : 'transparent',
                border: hovered ? '1px solid #333333' : '1px solid transparent',
                transition: 'background 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
                transform: hovered ? 'translateY(-2px)' : 'none',
            }}
        >
            {/* 16:9 Thumbnail Block */}
            <div style={{
                position: 'relative',
                width: '100%',
                paddingTop: '56.25%',
                borderRadius: 12,
                overflow: 'hidden',
                background: '#1c1c1c',
                marginBottom: 12,
                flexShrink: 0,
            }}>
                {course.thumbnailUrl ? (
                    <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        style={{
                            position: 'absolute', inset: 0,
                            width: '100%', height: '100%',
                            objectFit: 'cover', display: 'block',
                            transform: hovered ? 'scale(1.03)' : 'scale(1)',
                            transition: 'transform 0.4s ease',
                        }}
                    />
                ) : (
                    <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#666', fontSize: 11, fontWeight: 600,
                        letterSpacing: '0.08em', textTransform: 'uppercase',
                    }}>
                        No Preview
                    </div>
                )}

                {/* Category badge */}
                {course.categoryName && (
                    <span style={{
                        position: 'absolute', bottom: 8, left: 8,
                        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
                        color: '#f1f1f1', fontSize: 11, fontWeight: 600,
                        padding: '3px 8px', borderRadius: 4,
                    }}>
                        {course.categoryName}
                    </span>
                )}

                {/* Demo video button */}
                {course.demoVideoUrl && (
                    <button
                        onClick={e => { e.stopPropagation(); window.open(course.demoVideoUrl, '_blank'); }}
                        style={{
                            position: 'absolute', bottom: 8, right: 8,
                            background: 'rgba(0,0,0,0.75)', border: 'none',
                            borderRadius: '50%', width: 32, height: 32,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: '#f1f1f1',
                            transition: 'transform 0.15s ease',
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <PlayCircle size={18} />
                    </button>
                )}
            </div>

            {/* Info Row: Avatar + Title + Tutor */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <Link to={`/profile/${course.tutorId}`} onClick={e => e.stopPropagation()}>
                    <img
                        src={course.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.tutorName || 'T')}&background=1a2a2a&color=00C2CB`}
                        alt={course.tutorName}
                        style={{
                            width: 36, height: 36, borderRadius: '50%',
                            objectFit: 'cover', flexShrink: 0,
                            border: '1.5px solid #3f3f3f',
                        }}
                    />
                </Link>

                <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Title */}
                    <h3 style={{
                        margin: '0 0 4px', fontSize: 14, fontWeight: 600,
                        color: hovered ? '#00C2CB' : '#f1f1f1',
                        lineHeight: 1.4,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        transition: 'color 0.15s',
                    }}>
                        {course.title}
                    </h3>

                    {/* Tutor Name with Checkmark */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, margin: '0 0 4px' }}>
                        <span style={{ fontSize: 12, color: '#aaaaaa' }}>
                            {course.tutorName}
                        </span>
                        <CheckCircle2 size={12} color="#00C2CB" />
                    </div>

                    {/* Slots + Price */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={11} color={noSeats ? '#ff4444' : '#aaaaaa'} />
                            <span style={{
                                fontSize: 12,
                                color: noSeats ? '#ff4444' : '#aaaaaa',
                                fontWeight: noSeats ? 600 : 400,
                            }}>
                                {noSeats
                                    ? 'Fully booked'
                                    : `${totalSlots} slot${totalSlots !== 1 ? 's' : ''} · ${seatsLeft} left`}
                            </span>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#00C2CB', whiteSpace: 'nowrap' }}>
                            {course.price === 0 ? 'Free' : `₹${course.price}`}
                        </span>
                    </div>
                </div>
            </div>

            {/* Enroll button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onEnroll(course);
                }}
                disabled={noSeats}
                style={{
                    marginTop: 10,
                    width: '100%',
                    padding: '8px 0',
                    borderRadius: 8,
                    border: 'none',
                    cursor: noSeats ? 'not-allowed' : 'pointer',
                    background: noSeats ? '#181818' : hovered ? '#00C2CB' : '#1f3434',
                    color: noSeats ? '#555' : '#fff',
                    fontSize: 13, fontWeight: 600,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    transition: 'background 0.2s ease',
                }}
            >
                <PlusCircle size={14} />
                {noSeats ? 'Fully Booked' : 'Enroll Now'}
            </button>
        </div>
    );
}
