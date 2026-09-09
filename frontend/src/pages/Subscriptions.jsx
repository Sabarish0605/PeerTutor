import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';

export default function Subscriptions() {
    const { user } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            const fetchCourses = async () => {
                try {
                    const res = await api.get(`/courses/subscriptions`);
                    setCourses(Array.isArray(res.data) ? res.data : []);
                } catch (error) {
                    console.error("Failed to fetch subscriptions feed", error);
                    toast.error("Failed to load your subscriptions.");
                } finally {
                    setLoading(false);
                }
            };
            fetchCourses();
        }
    }, [user]);

    const handleEnroll = async (courseId) => {
        try {
            await api.post(`/bookings/student/${user.id}/course/${courseId}`);
            toast.success("Successfully enrolled!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to enroll.");
        }
    };

    if (loading) {
        return <div className="text-center py-20 text-gray-500 font-medium">Loading your feed...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
            <h1 className="text-3xl font-extrabold text-gray-900">Your Subscriptions</h1>
            <p className="text-gray-600 font-medium mt-1">Latest courses from tutors you follow.</p>

            {courses.length === 0 ? (
                <div className="text-center py-20 bg-gray-100 rounded-3xl border border-dashed border-gray-300 shadow-sm flex flex-col items-center justify-center">
                    <span className="text-4xl mb-4">📭</span>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No updates yet</h3>
                    <p className="text-gray-600 font-medium max-w-md">You haven't subscribed to any tutors yet, or they haven't posted any new courses. Head over to Discover to find great tutors!</p>
                    <Link to="/dashboard" className="mt-6 bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-sm">Explore Discover</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {courses.map((course) => (
                        <div key={course.id} className="bg-gray-100 rounded-[24px] shadow-sm border border-gray-300 overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                            
                            {/* Horizontal Header (16:9) Image with Author Badge overlay */}
                            <div className="relative w-full h-48 bg-gray-200 rounded-t-[24px] overflow-hidden flex items-center justify-center">
                                {/* Author Badge */}
                                <Link to={`/profile/${course.tutorId}`} className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full pl-1 pr-3 py-1 flex items-center gap-2 hover:bg-white transition-colors shadow-sm z-10 cursor-pointer">
                                    <div className="w-7 h-7 rounded-full bg-gray-300 overflow-hidden flex items-center justify-center">
                                        {course.authorAvatar ? (
                                            <img src={course.authorAvatar} className="w-full h-full object-cover" alt="author" onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${course.tutorName || 'A'}&background=random`; }} />
                                        ) : (
                                            <span className="text-xs font-bold text-gray-700">{course.tutorName?.charAt(0)}</span>
                                        )}
                                    </div>
                                    <span className="text-xs font-bold text-gray-900">{course.tutorName}</span>
                                </Link>

                                {course.thumbnailUrl ? (
                                    <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-gray-400 text-xs font-medium uppercase tracking-wider">No Image</div>
                                )}
                            </div>

                            <div className="p-6 flex-1 flex flex-col gap-3">
                                <div>
                                    <span className="text-[10px] font-bold text-gray-900 uppercase tracking-wider bg-gray-200 px-2 py-1 rounded-md">{course.categoryName}</span>
                                    <h3 className="text-xl font-bold text-gray-900 mt-3 line-clamp-1">{course.title}</h3>
                                    <p className="text-sm text-gray-600 line-clamp-2 mt-2 font-medium">{course.description}</p>
                                </div>

                                <div className="mt-auto pt-4 border-t border-gray-200 flex items-center justify-between">
                                    <span className="text-lg font-bold text-gray-900">₹{course.price}</span>
                                    <div className="flex gap-2">
                                        {course.demoVideoUrl && (
                                            <button
                                                onClick={() => window.open(course.demoVideoUrl, '_blank')}
                                                className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-300 rounded-lg py-2 px-4 text-sm font-bold shadow-sm">
                                                ▶ Demo
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleEnroll(course.id)}
                                            className="bg-gray-800 hover:bg-gray-900 text-white transition-colors duration-300 rounded-lg py-2 px-5 text-sm font-bold shadow-sm">
                                            Enroll Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
