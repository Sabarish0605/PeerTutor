import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function StudentDashboard() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [subjects, setSubjects] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [reviewText, setReviewText] = useState('');
    const [rating, setRating] = useState(5);
    const [activeReviewId, setActiveReviewId] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch subjects
                const subRes = await api.get('/subjects');
                setSubjects(subRes.data);

                // Fetch student's bookings
                if (user?.id) {
                    const bookRes = await api.get(`/bookings/student/${user.id}`);
                    setBookings(bookRes.data);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            }
        };
        fetchData();
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const submitReview = async (bookingId) => {
        try {
            await api.post(`/reviews/student/${user.id}`, {
                bookingId: bookingId,
                rating: rating,
                comment: reviewText
            });
            alert('Review submitted successfully! The tutor\'s ranking has been updated.');
            setActiveReviewId(null);
            setReviewText('');
        } catch (error) {
            alert('Failed to submit review. You may have already reviewed this session.');
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user?.name}! 👋</h1>
                    <p className="text-gray-500">Ready to learn something new today?</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="bg-red-50 text-red-600 px-4 py-2 rounded-md font-medium hover:bg-red-100 transition">
                    Logout
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: My Bookings */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-bold text-gray-800">My Booked Sessions</h2>

                    {bookings.length === 0 ? (
                        <div className="text-center p-10 bg-white rounded-lg shadow-sm border border-dashed border-gray-300 text-gray-500">
                            You have no upcoming sessions. Book a tutor to get started!
                        </div>
                    ) : (
                        bookings.map((booking) => (
                            <div key={booking.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{booking.subject?.name || 'Subject'}</span>
                                    <h3 className="text-lg font-bold text-gray-800">Tutor: {booking.tutor?.user?.name || 'Expert'}</h3>
                                    <p className="text-sm text-gray-600">Date: {booking.sessionDate} | {booking.startTime} - {booking.endTime}</p>
                                </div>

                                {activeReviewId === booking.id ? (
                                    <div className="bg-gray-50 p-4 rounded-md border w-full md:w-auto">
                                        <select value={rating} onChange={(e) => setRating(parseInt(e.target.value))} className="mb-2 w-full p-1 border rounded">
                                            <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                                            <option value="4">⭐⭐⭐⭐ (4/5)</option>
                                            <option value="3">⭐⭐⭐ (3/5)</option>
                                            <option value="2">⭐⭐ (2/5)</option>
                                            <option value="1">⭐ (1/5)</option>
                                        </select>
                                        <textarea
                                            placeholder="Leave a comment..."
                                            className="w-full p-2 border rounded text-sm mb-2"
                                            value={reviewText}
                                            onChange={(e) => setReviewText(e.target.value)}
                                        />
                                        <div className="flex gap-2">
                                            <button onClick={() => submitReview(booking.id)} className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">Submit</button>
                                            <button onClick={() => setActiveReviewId(null)} className="bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setActiveReviewId(booking.id)}
                                        className="bg-blue-50 text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-blue-100 transition whitespace-nowrap">
                                        Leave Review
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Right Column: Subjects (Kept from earlier) */}
                <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Explore Subjects</h2>
                    <div className="flex flex-col gap-3">
                        {subjects.map((subject) => (
                            <div key={subject.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-800">{subject.name}</h3>
                                <span className="text-xs text-gray-500">{subject.category}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}