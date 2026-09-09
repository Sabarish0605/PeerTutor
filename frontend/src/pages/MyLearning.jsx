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
                    {bookings.map((booking) => (
                        <div key={booking.id} className="bg-white border border-gray-200 hover:border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group">
                            <div>
                                <div className="relative w-full aspect-video bg-gray-100 overflow-hidden border-b border-gray-200">
                                    {booking.course?.thumbnailUrl ? (
                                        <img src={booking.course.thumbnailUrl} alt={booking.course?.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-semibold tracking-wider uppercase bg-gray-50">No Preview</div>
                                    )}
                                    
                                    <Link to={`/profile/${booking.course?.tutorId}`} className="absolute bottom-3 left-3 flex items-center gap-2 bg-white/95 border border-gray-200 hover:border-blue-300 backdrop-blur-sm px-2.5 py-1.5 rounded-md shadow-sm transition-all z-10 cursor-pointer">
                                        <img src={booking.course?.authorAvatar || `https://ui-avatars.com/api/?name=${booking.course?.tutorName || 'Unknown'}&background=EBF5FF&color=1E3A8A`} className="w-6 h-6 rounded-full object-cover ring-2 ring-white" />
                                        <span className="text-xs text-gray-700 font-medium hover:text-blue-600">{booking.course?.tutorName}</span>
                                    </Link>

                                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/95 border border-gray-200 backdrop-blur-sm px-2.5 py-1 rounded-md shadow-sm">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                        <span className="text-[11px] text-gray-700 font-semibold uppercase">{booking.status}</span>
                                    </div>
                                </div>

                                <div className="p-5 flex flex-col gap-3">
                                    <h3 className="text-lg text-gray-900 font-bold mb-1 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                                        {booking.course?.title}
                                    </h3>
                                    <p className="text-[11px] text-gray-500 uppercase font-semibold">
                                        Enrolled: {new Date(booking.bookingDate).toLocaleDateString()}
                                    </p>

                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-2">
                                        <p className="text-[11px] text-gray-500 mb-1 font-semibold">SCHEDULED SESSION:</p>
                                        <p className="text-sm text-blue-700 font-bold">
                                            {booking.slot ? new Date(booking.slot.slotDateTime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'Not Scheduled'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 pt-0 flex flex-col gap-3 border-t border-gray-100 pt-4 mt-auto">
                                <div className="flex gap-2">
                                    {booking.course?.meetLink ? (
                                        <button onClick={() => window.open(booking.course.meetLink, '_blank')} className="flex-1 inline-flex justify-center items-center gap-1.5 text-sm text-white font-semibold bg-blue-600 hover:bg-blue-700 py-2.5 rounded-lg shadow-sm transition-all">
                                            <span className="material-symbols-outlined text-[18px]">videocam</span> Join Class
                                        </button>
                                    ) : (
                                        <button disabled className="flex-1 inline-flex justify-center items-center gap-1.5 text-sm text-gray-500 bg-gray-100 border border-gray-200 py-2.5 rounded-lg cursor-not-allowed font-medium">
                                            <span className="material-symbols-outlined text-[18px]">hourglass_empty</span> Pending Link
                                        </button>
                                    )}
                                    {booking.course?.demoVideoUrl && (
                                        <button onClick={() => window.open(booking.course.demoVideoUrl, '_blank')} className="flex-1 inline-flex justify-center items-center gap-1.5 text-sm text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 py-2.5 rounded-lg transition-all font-medium">
                                            <span className="material-symbols-outlined text-[18px]">play_circle</span> Replay
                                        </button>
                                    )}
                                </div>
                                <button onClick={() => { setSelectedBooking(booking); setReviewModalOpen(true); }} className="w-full inline-flex justify-center items-center gap-1.5 text-sm text-gray-600 bg-transparent hover:bg-gray-50 border border-gray-300 py-2.5 rounded-lg transition-all mt-1 font-medium">
                                    <span className="material-symbols-outlined text-[18px]">rate_review</span> Leave a Review
                                </button>
                            </div>
                        </div>
                    ))}
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
