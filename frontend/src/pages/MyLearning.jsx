import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';

export default function MyLearning() {
    const { user } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

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
                    setBookings(Array.isArray(res.data) ? res.data : []);
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
            toast.success("Feedback submitted successfully. Thank you.");
            setReviewModalOpen(false);
            setReviewForm({ rating: 5, comment: '' });
        } catch (error) {
            console.error("Failed to submit review", error);
            toast.error(error.response?.data?.message || "Submission failed.");
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return <div className="text-center py-20 text-gray-500 font-sans text-sm animate-pulse">Loading your courses...</div>;
    }

    return (
        <div className="flex flex-col w-full max-w-6xl mx-auto pt-8 px-4 pb-16 font-sans">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl text-gray-900 font-bold tracking-tight mb-3">My Learning</h1>
                <p className="text-sm md:text-base text-gray-600">Review your enrolled courses and upcoming sessions.</p>
            </div>

            <div className="flex justify-between items-end mb-6">
                <h2 className="text-xl text-gray-900 font-bold">
                    <span className="text-blue-600">{bookings.length}</span> Active Enrollments
                </h2>
            </div>

            {bookings.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500 text-sm">
                    You haven't enrolled in any courses yet. Check out the Discover section!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {bookings.map((booking, idx) => {
                        const bgColors = ['bg-indigo-50', 'bg-blue-50', 'bg-purple-50', 'bg-pink-50'];
                        const cardBg = bgColors[idx % bgColors.length];
                        
                        return (
                        <div key={booking.id} className={`${cardBg} rounded-[32px] p-3 transition-all hover:-translate-y-1 hover:shadow-md group flex flex-col`}>
                            <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col h-full border border-slate-100">
                                {/* Image */}
                                <div className="relative w-full aspect-video bg-slate-100 rounded-xl overflow-hidden mb-4">
                                    {booking.course?.thumbnailUrl ? (
                                        <img src={booking.course.thumbnailUrl} alt={booking.course?.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-medium tracking-wider uppercase bg-slate-50">No Preview</div>
                                    )}
                                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/95 border border-slate-200 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                        <span className="text-[11px] text-slate-700 font-semibold uppercase">{booking.status}</span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex flex-col flex-grow">
                                    <h3 className="text-lg text-slate-800 font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                                        {booking.course?.title}
                                    </h3>
                                    <p className="text-[11px] text-slate-500 uppercase font-semibold mb-2">
                                        Enrolled: {new Date(booking.bookingDate).toLocaleDateString()}
                                    </p>

                                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mt-auto mb-4">
                                        <p className="text-[11px] text-slate-500 mb-1 font-semibold uppercase tracking-wider">Scheduled Session:</p>
                                        <p className="text-sm text-secondary font-bold">
                                            {booking.slot ? new Date(booking.slot.slotDateTime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'Not Scheduled'}
                                        </p>
                                    </div>
                                </div>

                                {/* Footer Row 1: Author */}
                                <div className="flex items-center justify-between mb-3">
                                    <Link to={`/profile/${booking.course?.tutorId}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                        <img src={booking.course?.authorAvatar || `https://ui-avatars.com/api/?name=${booking.course?.tutorName || 'Unknown'}&background=EBF5FF&color=00C2CB`} className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-50" />
                                        <span className="text-sm text-slate-700 font-semibold">{booking.course?.tutorName}</span>
                                    </Link>
                                </div>

                                {/* Footer Row 2: Actions */}
                                <div className="flex flex-col gap-2 border-t border-slate-100 pt-3 mt-auto">
                                    <div className="flex gap-2">
                                        {booking.course?.meetLink ? (
                                            <button onClick={() => window.open(booking.course.meetLink, '_blank')} className="flex-1 inline-flex justify-center items-center gap-1.5 text-sm text-white font-semibold bg-secondary hover:bg-secondary-hover py-2.5 rounded-xl shadow-sm transition-all">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect width="15" height="14" x="1" y="5" rx="2" ry="2"/></svg>
                                                Join Class
                                            </button>
                                        ) : (
                                            <button disabled className="flex-1 inline-flex justify-center items-center gap-1.5 text-sm text-slate-400 bg-slate-50 border border-slate-200 py-2.5 rounded-xl cursor-not-allowed font-medium">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/></svg>
                                                Pending Link
                                            </button>
                                        )}
                                        {booking.course?.demoVideoUrl && (
                                            <button onClick={() => window.open(booking.course.demoVideoUrl, '_blank')} className="flex-1 inline-flex justify-center items-center gap-1.5 text-sm text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 py-2.5 rounded-xl transition-all font-medium shadow-sm">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
                                                Replay
                                            </button>
                                        )}
                                    </div>
                                    <button onClick={() => { setSelectedBooking(booking); setReviewModalOpen(true); }} className="w-full inline-flex justify-center items-center gap-1.5 text-sm text-slate-600 hover:text-primary bg-transparent hover:bg-slate-50 border border-slate-200 py-2.5 rounded-xl transition-all font-medium">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                        Leave a Review
                                    </button>
                                </div>
                            </div>
                        </div>
                    )})}
                </div>
            )}

            {/* Review Modal */}
            {reviewModalOpen && selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white border border-gray-200 rounded-xl w-full max-w-md shadow-xl relative">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-600">rate_review</span>
                                <h2 className="text-sm text-gray-900 font-bold uppercase tracking-wider">Course Feedback</h2>
                            </div>
                            <button onClick={() => setReviewModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-all flex items-center justify-center">
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>
                        
                        <div className="p-6">
                            <p className="text-sm text-gray-600 mb-6">
                                How was your experience with:<br/>
                                <span className="text-gray-900 font-bold">{selectedBooking.course?.title}</span>
                            </p>
                            
                            <form onSubmit={handleSubmitReview} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                        Rating
                                    </label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <svg
                                                key={star}
                                                onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                className={`w-8 h-8 cursor-pointer transition-colors ${
                                                    star <= (hoverRating || reviewForm.rating)
                                                        ? 'text-yellow-400'
                                                        : 'text-gray-300'
                                                }`}
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                        Review Comment
                                    </label>
                                    <textarea 
                                        rows="4" 
                                        className="w-full bg-white text-gray-900 placeholder:text-gray-400 text-sm rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        placeholder="Share your thoughts..."
                                        value={reviewForm.comment}
                                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                        required
                                    />
                                </div>
                                
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setReviewModalOpen(false)} className="flex-1 py-3 px-4 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg transition-all">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={submittingReview} className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition-all shadow-sm">
                                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
