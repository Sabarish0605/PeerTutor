import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export default function MyLearning() {
    const { user } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            const fetchBookings = async () => {
                try {
                    // Call the endpoint we built earlier!
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

    if (loading) {
        return <div className="text-center py-20 text-gray-500 font-medium">Loading your classes...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
            {/* Header Section */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">My Learning</h1>
                <p className="text-gray-500">Access your enrolled courses, schedules, and class materials.</p>
            </div>

            {/* Bookings Grid */}
            {bookings.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300 text-gray-500 font-medium">
                    You haven't enrolled in any courses yet. Head over to the Discover page to find your next class!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookings.map((booking) => (
                        <div key={booking.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition">

                            {/* Thumbnail */}
                            <div className="h-32 bg-gray-100 relative">
                                {booking.course?.thumbnailUrl ? (
                                    <img src={booking.course.thumbnailUrl} alt={booking.course?.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-medium uppercase tracking-wider">No Image</div>
                                )}
                                <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2.5 py-1 rounded-md font-bold shadow-sm">
                                    {booking.status}
                                </span>
                            </div>

                            {/* Content */}
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">{booking.course?.title}</h3>
                                <p className="text-xs text-gray-500 mb-4 font-medium uppercase tracking-wider">
                                    Enrolled: {new Date(booking.bookingDate).toLocaleDateString()}
                                </p>

                                {/* Schedule Block */}
                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-5">
                                    <p className="text-xs font-semibold text-blue-800 text-center uppercase tracking-wide mb-1">Your Schedule</p>
                                    <p className="text-sm font-bold text-blue-900 text-center">
                                        Every {booking.course?.scheduleDay} <br/>
                                        {booking.course?.scheduleTime} - {booking.course?.scheduleEndTime}
                                    </p>
                                </div>

                                {/* Action Button */}
                                <div className="mt-auto">
                                    <button
                                        onClick={() => alert(`Connecting to Zoom for ${booking.course?.title}...`)}
                                        className="w-full bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition shadow-sm flex justify-center items-center gap-2">
                                        <span>▶</span> Join Live Class
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}