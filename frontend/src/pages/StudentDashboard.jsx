import { useState, useEffect, useContext, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import EnrollmentModal from '../components/EnrollmentModal';
import { isSlotExpired } from '../utils/dateUtils';
import { PlayCircle, PlusCircle, Clock, ChevronRight, ChevronLeft, CheckCircle, Search, X } from 'lucide-react';

const T = {
    bg:        '#0f0f0f',
    card:      '#212121',
    hover:     '#272727',
    border:    '#3f3f3f',
    text:      '#f1f1f1',
    muted:     '#aaaaaa',
    accent:    '#00C2CB',
};

const CS_CATEGORIES = [
    "Software Development", "Databases", "Cloud & DevOps",
    "Cybersecurity", "Networking", "AI & Machine Learning",
    "Data Science", "Hardware & Systems",
];

/* ── Scrollable YouTube-style category chip bar (Bidirectional) ── */
function CategoryBar({ selected, onSelect }) {
    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const categories = ["All", ...CS_CATEGORIES];

    const checkScrollButtons = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 10);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        checkScrollButtons();
        window.addEventListener('resize', checkScrollButtons);
        return () => window.removeEventListener('resize', checkScrollButtons);
    }, []);

    const scroll = (dir) => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: dir * 260, behavior: 'smooth' });
            setTimeout(checkScrollButtons, 350);
        }
    };

    return (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: 24 }}>
            {/* Left scroll arrow */}
            {canScrollLeft && (
                <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0, zIndex: 10,
                    display: 'flex', alignItems: 'center',
                    background: 'linear-gradient(90deg, #0f0f0f 70%, transparent 100%)',
                    paddingRight: 16,
                }}>
                    <button
                        onClick={() => scroll(-1)}
                        style={{
                            width: 34, height: 34,
                            borderRadius: '50%',
                            border: '1px solid #3f3f3f',
                            background: '#212121',
                            color: '#f1f1f1',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'background 0.15s, transform 0.1s',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#383838'}
                        onMouseLeave={e => e.currentTarget.style.background = '#212121'}
                        title="Previous categories"
                    >
                        <ChevronLeft size={18} />
                    </button>
                </div>
            )}

            {/* Chips strip */}
            <div
                ref={scrollRef}
                onScroll={checkScrollButtons}
                style={{
                    display: 'flex',
                    gap: 10,
                    overflowX: 'auto',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    paddingBottom: 2,
                    flex: 1,
                    scrollBehavior: 'smooth',
                    paddingLeft: canScrollLeft ? 44 : 0,
                    paddingRight: canScrollRight ? 44 : 0,
                    transition: 'padding 0.2s ease',
                }}
            >
                {categories.map(cat => {
                    const active = cat === selected || (cat === 'All' && selected === '');
                    return (
                        <button
                            key={cat}
                            onClick={() => onSelect(cat === 'All' ? '' : cat)}
                            style={{
                                flexShrink: 0,
                                padding: '7px 15px',
                                borderRadius: 8,
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: 13,
                                fontWeight: active ? 600 : 500,
                                fontFamily: 'Roboto, Inter, sans-serif',
                                whiteSpace: 'nowrap',
                                transition: 'background 0.15s, color 0.15s',
                                background: active ? '#f1f1f1' : '#272727',
                                color:      active ? '#0f0f0f'  : '#f1f1f1',
                            }}
                            onMouseEnter={e => {
                                if (!active) e.currentTarget.style.background = '#383838';
                            }}
                            onMouseLeave={e => {
                                if (!active) e.currentTarget.style.background = '#272727';
                            }}
                        >
                            {cat}
                        </button>
                    );
                })}
            </div>

            {/* Right scroll arrow */}
            {canScrollRight && (
                <div style={{
                    position: 'absolute', right: 0, top: 0, bottom: 0, zIndex: 10,
                    display: 'flex', alignItems: 'center',
                    background: 'linear-gradient(270deg, #0f0f0f 70%, transparent 100%)',
                    paddingLeft: 16,
                }}>
                    <button
                        onClick={() => scroll(1)}
                        style={{
                            width: 34, height: 34,
                            borderRadius: '50%',
                            border: '1px solid #3f3f3f',
                            background: '#212121',
                            color: '#f1f1f1',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'background 0.15s, transform 0.1s',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#383838'}
                        onMouseLeave={e => e.currentTarget.style.background = '#212121'}
                        title="Next categories"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            )}
        </div>
    );
}

export default function StudentDashboard() {
    const { user } = useContext(AuthContext);
    const [searchParams, setSearchParams] = useSearchParams();
    const searchQuery = (searchParams.get('q') || '').trim();

    const [courses, setCourses] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [enrollingCourse, setEnrollingCourse] = useState(null);

    const fetchMarketplaceData = async () => {
        try {
            // Include studentId so the backend can return enrolledSlotId per course
            const params = user?.id ? `?studentId=${user.id}` : '';
            const res = await api.get(`/courses${params}`);
            setCourses(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Failed to load marketplace data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMarketplaceData(); }, []);

    const filteredCourses = courses.filter(c => {
        const matchesCategory = selectedCategory === '' || c.categoryName === selectedCategory;
        if (!matchesCategory) return false;

        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        const titleMatch = c.title?.toLowerCase().includes(q);
        const descMatch = c.description?.toLowerCase().includes(q);
        const catMatch = c.categoryName?.toLowerCase().includes(q);
        const tutorMatch = c.tutorName?.toLowerCase().includes(q);
        return Boolean(titleMatch || descMatch || catMatch || tutorMatch);
    });

    const handleEnrollClick = (course) => {
        if (!user?.id) { toast.error("Please log in to enroll."); return; }
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
                fetchMarketplaceData();
            } catch (err) {
                toast.error(err.response?.data?.message || 'Enrollment failed.', { id: "payment" });
            }
        }, 1500);
    };

    const slotStats = (course) => {
        if (!course.slots?.length) return { totalSlots: 0, seatsLeft: 0 };
        // Only count upcoming (non-expired) slots
        const upcoming = course.slots.filter(sl => !isSlotExpired(sl));
        return {
            totalSlots: upcoming.length,
            seatsLeft: upcoming.reduce((s, sl) => s + Math.max(0, (sl.maxSeats || 0) - (sl.currentEnrolled || 0)), 0),
        };
    };

    if (loading) {
        return (
            <div style={{ color: T.muted, background: T.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                Scanning marketplace...
            </div>
        );
    }

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '20px 24px 64px', fontFamily: 'Roboto, Inter, sans-serif', color: T.text }}>

            {/* ── YouTube-style category chip bar (sticky) ── */}
            <div style={{
                position: 'sticky', top: 0, zIndex: 30,
                background: T.bg,
                paddingTop: 12,
                paddingBottom: 4,
                marginBottom: 8,
            }}>
                <CategoryBar selected={selectedCategory} onSelect={setSelectedCategory} />
            </div>

            {/* ── Active Search Indicator ── */}
            {searchQuery && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#1a1a1a',
                    border: `1px solid ${T.border}`,
                    borderRadius: 12,
                    padding: '10px 16px',
                    marginBottom: 20,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Search size={16} color={T.accent} />
                        <span style={{ fontSize: 14, color: T.text }}>
                            Results for <strong style={{ color: T.accent }}>"{searchQuery}"</strong> ({filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} found)
                        </span>
                    </div>
                    <button
                        onClick={() => {
                            const next = new URLSearchParams(searchParams);
                            next.delete('q');
                            setSearchParams(next);
                        }}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: T.muted,
                            fontSize: 13,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '4px 8px',
                            borderRadius: 6,
                            transition: 'color 0.15s, background 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = '#272727'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = T.muted; e.currentTarget.style.background = 'transparent'; }}
                    >
                        <X size={14} /> Clear search
                    </button>
                </div>
            )}

            {/* ── Course grid ── */}
            {filteredCourses.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '80px 20px',
                    border: `1.5px dashed ${T.border}`, borderRadius: 16,
                    color: T.muted, fontSize: 14,
                }}>
                    <p style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600, color: T.text }}>
                        {searchQuery ? `No courses matching "${searchQuery}"` : 'No courses found for this category.'}
                    </p>
                    <p style={{ margin: 0, fontSize: 13, color: '#888' }}>
                        {searchQuery ? 'Try searching by tutor name, topic, or a different keyword.' : 'Check back later for new peer-led sessions.'}
                    </p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
                    gap: '20px 16px',
                }}>
                    {filteredCourses.map(course => {
                        const { totalSlots, seatsLeft } = slotStats(course);
                        const isEnrolled = !!course.enrolledSlotId;
                        return (
                            <CourseCard
                                key={course.id}
                                course={course}
                                totalSlots={totalSlots}
                                seatsLeft={seatsLeft}
                                onEnroll={handleEnrollClick}
                                isEnrolled={isEnrolled}
                            />
                        );
                    })}
                </div>
            )}

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

/* ── YouTube-style dark course card with hover highlighting ── */
function CourseCard({ course, totalSlots, seatsLeft, onEnroll, isEnrolled }) {
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
            {/* 16:9 Thumbnail */}
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

                {/* Demo play */}
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

            {/* Info row — avatar + text (YouTube style) */}
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

                    {/* Tutor */}
                    <p style={{ margin: '0 0 4px', fontSize: 12, color: '#aaaaaa' }}>
                        {course.tutorName}
                    </p>

                    {/* Slots + price */}
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

            {/* Enroll / Already-Enrolled button */}
            {isEnrolled ? (
                <button
                    disabled
                    style={{
                        marginTop: 10,
                        width: '100%',
                        padding: '8px 0',
                        borderRadius: 8,
                        border: '1px solid rgba(74,222,128,0.35)',
                        cursor: 'not-allowed',
                        background: 'rgba(74,222,128,0.08)',
                        color: '#4ade80',
                        fontSize: 13, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                >
                    <CheckCircle size={14} />
                    Already Enrolled
                </button>
            ) : (
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
            )}
        </div>
    );
}
