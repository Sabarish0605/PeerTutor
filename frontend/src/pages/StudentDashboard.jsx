import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export default function StudentDashboard() {
    const { user } = useContext(AuthContext); // Grabs the logged-in student

    const [courses, setCourses] = useState([]);
    const [categories, setCategories] = useState([]);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMarketplaceData = async () => {
            try {
                const [coursesRes, catsRes] = await Promise.all([
                    api.get('/courses'),
                    api.get('/subjects')
                ]);

                setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : []);
                setCategories(Array.isArray(catsRes.data) ? catsRes.data : []);
            } catch (error) {
                console.error("Failed to load marketplace data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMarketplaceData();
    }, []);

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.tutorName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === '' || course.categoryName === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    // THE ENROLLMENT ENGINE
    const handleEnroll = async (courseId) => {
        if (!user || !user.id) {
            alert("Please log in to enroll in a course.");
            return;
        }

        try {
            await api.post(`/bookings/student/${user.id}/course/${courseId}`);
            alert("🎉 Successfully enrolled! Your seat is secured.");
        } catch (error) {
            console.error("Enrollment Error:", error);
            alert(error.response?.data?.message || 'Failed to enroll in course. Check the console for details.');
        }
    };

    if (loading) {
        return <div className="text-center py-20 text-gray-500 font-medium">Loading Marketplace...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                <div className="max-w-3xl">
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Discover Courses</h1>
                    <p className="text-gray-500 mb-8">Browse group sessions, master new skills, and learn from top peer tutors.</p>

                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search for 'React', 'Calculus', or a Tutor's Name..."
                                className="w-full p-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="w-full md:w-64">
                            <select
                                className="w-full p-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <div className="flex justify-between items-end mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                        {filteredCourses.length} {filteredCourses.length === 1 ? 'Course' : 'Courses'} Available
                    </h2>
                </div>

                {filteredCourses.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300 text-gray-500">
                        No courses found matching your search criteria. Try clearing your filters!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredCourses.map((course) => (
                            <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition duration-200">
                                <div className="h-40 bg-gray-100 relative">
                                    {course.thumbnailUrl ? (
                                        <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-medium uppercase tracking-wider">No Image</div>
                                    )}
                                    <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2.5 py-1 rounded-md font-bold shadow-sm">
                                        {course.categoryName}
                                    </span>
                                </div>

                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2 leading-tight">{course.title}</h3>
                                        <p className="text-sm text-gray-500 mb-3 font-medium">By {course.tutorName}</p>

                                        <div className="bg-gray-50 border border-gray-100 rounded-lg p-2.5 mb-4">
                                            <p className="text-xs font-semibold text-gray-700 text-center">
                                                Every {course.scheduleDay} <br/>
                                                <span className="text-blue-600">{course.scheduleTime} - {course.scheduleEndTime}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100 pt-4 mt-auto flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-500 font-medium">Price per seat</span>
                                            <span className="text-xl font-extrabold text-gray-900">₹{course.price}</span>
                                        </div>
                                        <button
                                            onClick={() => handleEnroll(course.id)}
                                            className="bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-600 transition shadow-sm">
                                            Enroll Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}