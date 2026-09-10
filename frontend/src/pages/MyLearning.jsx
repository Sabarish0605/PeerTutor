import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { 
    BookOpen, Clock, Video, PlayCircle, Star, 
    X, ArrowRight, Award, ChevronLeft, ChevronRight 
} from 'lucide-react';

const T = {
    bg:        '#0f0f0f',
    card:      '#212121',
    hover:     '#272727',
    border:    '#3f3f3f',
    text:      '#f1f1f1',
    muted:     '#aaaaaa',
    accent:    '#00C2CB',
};

/* ── YouTube-Style Category Filter Chips (Identical to Home page) ── */
function LearningCategoryBar({ categories, selected, onSelect }) {
    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

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
    }, [categories]);

    const scroll = (dir) => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: dir * 240, behavior: 'smooth' });
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
                            transition: 'background 0.15s',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#383838'}
                        onMouseLeave={e => e.currentTarget.style.background = '#212121'}
                        title="Scroll left"
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
                    const active = cat === selected;
                    return (
                        <button
                            key={cat}
                            onClick={() => onSelect(cat)}
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
                            transition: 'background 0.15s',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#383838'}
                        onMouseLeave={e => e.currentTarget.style.background = '#212121'}
                        title="Scroll right"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            )}
        </div>
    );
}

export default function MyLearning() {
    const { user } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');

    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);

    useEffect(() => {
        if (user?.id) {
            const fetchBookings = async () => {
                try {
                    const res = await api.get(`/bookings/student/${user.id}`);
                    const data = Array.isArray(res.data) ? res.data : [];
                    setBookings(data);

                    // Auto-prompt review for first CLOSED slot that hasn't been reviewed yet
                    const closedUnreviewed = data.find(b =>
                        b.slot?.sessionStatus === 'CLOSED' && !b.reviewed
                    );
                    if (closedUnreviewed) {
                        setSelectedBooking(closedUnreviewed);
                        setReviewModalOpen(true);
                    }
                } catch (error) {
                    console.error("Failed to load learning dashboard", error);
                } finally {
                    setLoading(false);
                }
            };

            fetchBookings();
        }
    }, [user]);


    const handleSubmitReview = async (e) => {
        e.preventDefault();
        setSubmittingReview(true);
        try {
            await api.post(`/reviews/student/${user.id}/booking/${selectedBooking.id}`, reviewForm);
            toast.success("Feedback submitted successfully. Thank you!");
            setReviewModalOpen(false);
            setReviewForm({ rating: 5, comment: '' });
        } catch (error) {
            console.error("Failed to submit review", error);
            toast.error(error.response?.data?.message || "Submission failed.");
        } finally {
            setSubmittingReview(false);
        }
    };

    // Filter categories dynamically
    const categories = ['All', 'Upcoming Sessions', 'Active Courses'];
    const courseCategories = Array.from(new Set(bookings.map(b => b.course?.categoryName).filter(Boolean)));
    courseCategories.forEach(c => {
        if (!categories.includes(c)) categories.push(c);
    });

    const filteredBookings = bookings.filter(b => {
        if (selectedCategory === 'All') return true;
        if (selectedCategory === 'Upcoming Sessions') {
            if (!b.slot?.slotDateTime) return false;
            return new Date(b.slot.slotDateTime) >= new Date();
        }
        if (selectedCategory === 'Active Courses') {
            return (b.status || 'ACTIVE').toUpperCase() === 'ACTIVE';
        }
        return b.course?.categoryName === selectedCategory;
    });

    if (loading) {
        return (
            <div style={{
                background: '#0f0f0f', minHeight: '100vh',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#aaaaaa', fontSize: 14, fontFamily: 'Roboto, Inter, sans-serif',
            }}>
                Loading your enrolled courses...
            </div>
        );
    }

    return (
        <div style={{
            background: '#0f0f0f',
            minHeight: '100vh',
            color: '#f1f1f1',
            fontFamily: 'Roboto, Inter, sans-serif',
            padding: '16px 24px 80px',
        }}>
            {/* Category Chips Filter Bar (Exact Same Structure as Home Page) */}
            {bookings.length > 0 && (
                <LearningCategoryBar
                    categories={categories}
                    selected={selectedCategory}
                    onSelect={setSelectedCategory}
                />
            )}

            {/* Empty State */}
            {bookings.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '80px 24px',
                    background: '#161616',
                    borderRadius: 24,
                    border: '1px solid #272727',
                    maxWidth: 540,
                    margin: '40px auto 0',
                    boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
                }}>
                    <div style={{
                        width: 68,
                        height: 68,
                        borderRadius: '50%',
                        background: 'rgba(0,194,203,0.1)',
                        border: '1px solid rgba(0,194,203,0.2)',
                        color: '#00C2CB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px',
                    }}>
                        <BookOpen size={30} />
                    </div>

                    <h2 style={{ fontSize: 20, fontWeight: 700, color: '#f1f1f1', margin: '0 0 8px' }}>
                        No Enrolled Courses Yet
                    </h2>
                    <p style={{
                        fontSize: 13,
                        color: '#aaaaaa',
                        maxWidth: 380,
                        margin: '0 auto 24px',
                        lineHeight: 1.6,
                    }}>
                        Explore the marketplace, discover skilled peer tutors, and book your first interactive learning session!
                    </p>

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
            ) : filteredBookings.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '60px 0',
                    color: '#aaaaaa', fontSize: 14,
                }}>
                    No enrolled courses match the selected category.
                </div>
            ) : (
                /* ── Enrolled Courses Grid (Exact Same Architecture as Home / Discover Page) ── */
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
                    gap: '20px 16px',
                }}>
                    {filteredBookings.map(booking => (
                        <LearningCourseItem
                            key={booking.id}
                            booking={booking}
                            onOpenReview={() => {
                                setSelectedBooking(booking);
                                setReviewModalOpen(true);
                            }}
                        />
                    ))}
                </div>
            )}

            {/* ── Review Feedback Modal (YouTube Dark Theme) ── */}
            {reviewModalOpen && selectedBooking && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 100,
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
                }}>
                    <div style={{
                        background: '#1c1c1c', border: '1px solid #383838', borderRadius: 20,
                        width: '100%', maxWidth: 440, overflow: 'hidden',
                        boxShadow: '0 24px 60px rgba(0,0,0,0.85)',
                    }}>
                        {/* Modal Header */}
                        <div style={{
                            padding: '16px 20px', background: '#151515',
                            borderBottom: '1px solid #2a2a2a',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Award size={18} color="#00C2CB" />
                                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#f1f1f1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Course Feedback
                                </h3>
                            </div>
                            <button
                                onClick={() => setReviewModalOpen(false)}
                                style={{
                                    background: 'transparent', border: 'none', color: '#aaaaaa',
                                    cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center',
                                }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <form onSubmit={handleSubmitReview} style={{ padding: 20 }}>
                            <p style={{ fontSize: 13, color: '#aaaaaa', margin: '0 0 16px' }}>
                                How was your learning experience with:<br />
                                <span style={{ color: '#f1f1f1', fontWeight: 600 }}>{selectedBooking.course?.title}</span>
                            </p>

                            {/* Rating Stars */}
                            <div style={{ marginBottom: 18 }}>
                                <label style={{ display: 'block', fontSize: 11, color: '#888', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>
                                    Your Rating
                                </label>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            type="button"
                                            key={star}
                                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            style={{
                                                background: 'transparent', border: 'none', cursor: 'pointer', padding: 2,
                                                transform: (hoverRating || reviewForm.rating) >= star ? 'scale(1.15)' : 'scale(1)',
                                                transition: 'transform 0.1s ease',
                                            }}
                                        >
                                            <Star
                                                size={28}
                                                color={star <= (hoverRating || reviewForm.rating) ? '#facc15' : '#444444'}
                                                fill={star <= (hoverRating || reviewForm.rating) ? '#facc15' : 'none'}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Comment */}
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', fontSize: 11, color: '#888', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>
                                    Review Comment
                                </label>
                                <textarea
                                    rows="4"
                                    required
                                    placeholder="Share your thoughts about the instructor, pacing, and learning material..."
                                    value={reviewForm.comment}
                                    onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                    style={{
                                        width: '100%', background: '#121212', border: '1px solid #333333',
                                        borderRadius: 10, padding: '10px 12px', color: '#f1f1f1', fontSize: 13,
                                        outline: 'none', boxSizing: 'border-box', fontFamily: 'Roboto, Inter, sans-serif',
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#00C2CB'}
                                    onBlur={e => e.target.style.borderColor = '#333333'}
                                />
                            </div>

                            {/* Buttons */}
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button
                                    type="button"
                                    onClick={() => setReviewModalOpen(false)}
                                    style={{
                                        flex: 1, padding: '10px 0', borderRadius: 10,
                                        background: '#242424', border: '1px solid #383838',
                                        color: '#aaa', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingReview}
                                    style={{
                                        flex: 1, padding: '10px 0', borderRadius: 10,
                                        background: '#00C2CB', border: 'none',
                                        color: '#0f0f0f', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                        opacity: submittingReview ? 0.5 : 1,
                                    }}
                                >
                                    {submittingReview ? 'Submitting...' : 'Submit Feedback'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ── YouTube-Style Enrolled Course Item (Same Architecture as Home Page CourseCard) ── */
function LearningCourseItem({ booking, onOpenReview }) {
    const [hovered, setHovered] = useState(false);
    const course = booking.course;
    const slot = booking.slot;
    const sessionStatus = slot?.sessionStatus || 'SCHEDULED';
    const dateObj = slot?.startTime ? new Date(slot.startTime) : null;
    const endObj = slot?.endTime ? new Date(slot.endTime) : null;

    const statusConfig = {
        SCHEDULED: { label: 'Starting Soon', color: '#facc15', bg: 'rgba(250,204,21,0.12)', dot: '#facc15' },
        LIVE:      { label: 'Live Now',       color: '#4ade80', bg: 'rgba(74,222,128,0.12)', dot: '#4ade80' },
        CLOSED:    { label: 'Session Ended',  color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', dot: '#94a3b8' },
        EXPIRED:   { label: 'Expired',        color: '#555',    bg: 'rgba(255,255,255,0.04)', dot: '#555' },
    };
    const sc = statusConfig[sessionStatus] || statusConfig.SCHEDULED;

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'flex',
                flexDirection: 'column',
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
                {course?.thumbnailUrl ? (
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

                {/* Session status badge (top-right) */}
                <div style={{
                    position: 'absolute', top: 8, right: 8,
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
                    border: `1px solid ${sc.dot}44`,
                    borderRadius: 20, padding: '2px 8px',
                    display: 'flex', alignItems: 'center', gap: 5,
                }}>
                    <span style={{
                        width: 6, height: 6, borderRadius: '50%', background: sc.dot,
                        ...(sessionStatus === 'LIVE' ? { animation: 'pulse 1.5s infinite' } : {}),
                    }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: sc.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {sc.label}
                    </span>
                </div>

                {/* Category badge (bottom-left) */}
                {course?.categoryName && (
                    <span style={{
                        position: 'absolute', bottom: 8, left: 8,
                        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
                        color: '#f1f1f1', fontSize: 11, fontWeight: 600,
                        padding: '3px 8px', borderRadius: 4,
                    }}>
                        {course.categoryName}
                    </span>
                )}

                {/* Demo video play button (bottom-right) */}
                {course?.demoVideoUrl && (
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
                        title="Watch Demo / Replay"
                    >
                        <PlayCircle size={18} />
                    </button>
                )}
            </div>

            {/* Info Row */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <Link to={`/profile/${course?.tutorId}`} onClick={e => e.stopPropagation()}>
                    <img
                        src={course?.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(course?.tutorName || 'T')}&background=1a2a2a&color=00C2CB`}
                        alt={course?.tutorName}
                        style={{
                            width: 36, height: 36, borderRadius: '50%',
                            objectFit: 'cover', flexShrink: 0,
                            border: '1.5px solid #3f3f3f',
                        }}
                    />
                </Link>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                        margin: '0 0 4px', fontSize: 14, fontWeight: 600,
                        color: hovered ? '#00C2CB' : '#f1f1f1',
                        lineHeight: 1.4,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        transition: 'color 0.15s',
                    }}>
                        {course?.title || 'Enrolled Course'}
                    </h3>

                    <p style={{ margin: '0 0 4px', fontSize: 12, color: '#aaaaaa' }}>
                        {course?.tutorName}
                    </p>

                    {/* Session time */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={11} color="#00C2CB" />
                            <span style={{ fontSize: 12, color: '#00C2CB', fontWeight: 500 }}>
                                {dateObj
                                    ? `${dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} ${dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}${endObj ? ` – ${endObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}` : ''}`
                                    : 'Session scheduled'}
                            </span>
                        </div>
                        <span style={{ fontSize: 12, color: '#888' }}>
                            {course?.price === 0 ? 'Free' : course?.price ? `₹${course.price}` : 'Enrolled'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Action Row — status-aware */}
            <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                {/* Meet Link Button — only shown for SCHEDULED and LIVE */}
                {sessionStatus === 'SCHEDULED' && (
                    <button
                        disabled
                        style={{
                            flex: 1, padding: '8px 0', borderRadius: 8, border: '1px solid #2a2a2a',
                            cursor: 'not-allowed', background: '#181818', color: '#facc15',
                            fontSize: 13, fontWeight: 600,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        }}
                    >
                        <Clock size={14} />
                        <span>Starting Soon</span>
                    </button>
                )}

                {sessionStatus === 'LIVE' && course?.meetLink && (
                    <button
                        onClick={() => window.open(course.meetLink, '_blank')}
                        style={{
                            flex: 1, padding: '8px 0', borderRadius: 8, border: 'none',
                            cursor: 'pointer',
                            background: 'linear-gradient(135deg, #00C2CB, #00a8af)',
                            color: '#0f0f0f', fontSize: 13, fontWeight: 700,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            boxShadow: '0 0 16px rgba(0,194,203,0.35)',
                            animation: 'pulse 2s infinite',
                        }}
                    >
                        <Video size={14} />
                        <span>Join Meet</span>
                    </button>
                )}

                {/* CLOSED/EXPIRED: meet link hidden, review button shown for CLOSED only */}
                {(sessionStatus === 'CLOSED' || sessionStatus === 'EXPIRED') && (
                    <div style={{
                        flex: 1, padding: '8px 0', borderRadius: 8,
                        background: '#141414', border: '1px solid #2a2a2a',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, color: '#555', fontWeight: 500,
                    }}>
                        Session {sessionStatus === 'CLOSED' ? 'Closed' : 'Expired'}
                    </div>
                )}

                {/* Review button — ONLY for CLOSED slots */}
                {sessionStatus === 'CLOSED' && (
                    <button
                        onClick={onOpenReview}
                        title="Leave Feedback & Rating"
                        style={{
                            padding: '8px 14px', borderRadius: 8,
                            background: '#272727', border: '1px solid #333333',
                            color: '#facc15', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            fontSize: 12, fontWeight: 600,
                            transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#383838'}
                        onMouseLeave={e => e.currentTarget.style.background = '#272727'}
                    >
                        <Star size={14} fill="#facc15" />
                        <span>Review</span>
                    </button>
                )}
            </div>
        </div>
    );
}


