import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import EnrollmentModal from '../components/EnrollmentModal';
import { Search, Filter, ChevronDown, PlayCircle, PlusCircle } from 'lucide-react';

export default function StudentDashboard() {
    const { user } = useContext(AuthContext);

    const [courses, setCourses] = useState([]);
    const CS_CATEGORIES = [
        "Software Development", "Databases", "Cloud & DevOps", 
        "Cybersecurity", "Networking", "AI & Machine Learning", 
        "Data Science", "Hardware & Systems"
    ];

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [enrollingCourse, setEnrollingCourse] = useState(null);

    const fetchMarketplaceData = async () => {
        try {
            const coursesRes = await api.get('/courses');
            setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : []);
        } catch (error) {
            console.error("Failed to load marketplace data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMarketplaceData();
    }, []);

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.tutorName?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === '' || course.categoryName === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    const handleEnrollClick = (course) => {
        if (!user || !user.id) {
            toast.error("Please log in to enroll in a course.");
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
                toast.success("Payment Successful! Successfully enrolled!", { id: "payment" });
                fetchMarketplaceData();
            } catch (error) {
                console.error("Enrollment Error:", error);
                toast.error(error.response?.data?.message || 'Failed to enroll in course. Check the console for details.', { id: "payment" });
            }
        }, 1500);
    };

    if (loading) {
        return <div className="text-center py-20 text-gray-500 font-sans text-sm animate-pulse">Scanning marketplace...</div>;
    }

    return (
        <div className="flex flex-col w-full max-w-6xl mx-auto pt-8 px-4 pb-16 font-sans">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl text-gray-900 font-bold tracking-tight mb-3">Discover Modules</h1>
                <p className="text-sm md:text-base text-gray-600">Find the right peer tutor to level up your skills.</p>
            </div>

            {/* Search and Filter Area */}
            <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm mb-10">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search courses or tutors..."
                            className="w-full bg-gray-50 text-gray-900 placeholder-gray-400 text-sm rounded-lg border border-gray-300 pl-11 pr-4 py-3.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="w-full md:w-72 relative">
                        <Filter size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <select
                            className="w-full bg-gray-50 text-gray-900 text-sm rounded-lg border border-gray-300 pl-11 pr-10 py-3.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="">All Categories</option>
                            {CS_CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-end mb-6">
                <h2 className="text-xl text-gray-900 font-bold">
                    <span className="text-blue-600">{filteredCourses.length}</span> Modules Found
                </h2>
            </div>

            {filteredCourses.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500 text-sm">
                    No results found. Try adjusting your search filters.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => (
                        <div key={course.id} className="bg-white border border-gray-200 hover:border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group">
                            <div>
                                <div className="relative w-full aspect-video bg-gray-100 overflow-hidden border-b border-gray-200">
                                    {course.thumbnailUrl ? (
                                        <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-semibold tracking-wider uppercase bg-gray-50">No Preview</div>
                                    )}
                                    
                                    <Link to={`/profile/${course.tutorId}`} className="absolute bottom-3 left-3 flex items-center gap-2 bg-white/95 border border-gray-200 hover:border-blue-300 backdrop-blur-sm px-2.5 py-1.5 rounded-md shadow-sm transition-all z-10 cursor-pointer">
                                        <img src={course.authorAvatar || `https://ui-avatars.com/api/?name=${course.tutorName}&background=EBF5FF&color=1E3A8A`} alt="Tutor" className="w-6 h-6 rounded-full object-cover ring-2 ring-white" />
                                        <span className="text-xs text-gray-700 font-medium hover:text-blue-600">{course.tutorName}</span>
                                    </Link>
                                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/95 border border-gray-200 backdrop-blur-sm px-2.5 py-1 rounded-md shadow-sm">
                                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                        <span className="text-[11px] text-gray-700 font-semibold">{course.categoryName}</span>
                                    </div>
                                </div>

                                <div className="p-5 flex flex-col gap-3">
                                    <h3 className="text-lg text-gray-900 font-bold mb-1 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                                        {course.title}
                                    </h3>
                                    
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-2 min-h-[72px]">
                                        {course.slots?.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {course.slots.slice(0, 3).map(slot => {
                                                    const available = slot.maxSeats - slot.currentEnrolled;
                                                    const isFull = available <= 0;
                                                    return (
                                                        <div key={slot.id} className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-md border text-[11px] min-w-[65px] font-medium shadow-sm ${isFull ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-200 text-blue-600'}`}>
                                                            <span className="font-bold mb-0.5 tracking-tight">{new Date(slot.slotDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                            <span className="text-[9px] uppercase font-semibold">{isFull ? 'Full' : `${available} Left`}</span>
                                                        </div>
                                                    );
                                                })}
                                                {course.slots.length > 3 && (
                                                    <div className="flex items-center justify-center py-1.5 px-2.5 rounded-md border bg-white border-gray-200 text-gray-500 text-[11px] font-bold shadow-sm">
                                                        +{course.slots.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-[11px] text-gray-500 text-center py-2 font-medium">No active slots available</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 pt-0 flex flex-col gap-4 border-t border-gray-100 pt-4 mt-auto">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Tuition</span>
                                        <span className="text-xl text-gray-900 font-bold">${course.price}</span>
                                    </div>
                                    {course.demoVideoUrl && (
                                        <button onClick={() => window.open(course.demoVideoUrl, '_blank')} className="inline-flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg transition-all font-medium">
                                            <PlayCircle size={16} className="text-blue-500" />
                                            <span>Demo</span>
                                        </button>
                                    )}
                                </div>
                                <button onClick={() => handleEnrollClick(course)} className="bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 transition-colors active:scale-[0.98] w-full">
                                    <PlusCircle size={18} />
                                    <span>Enroll Now</span>
                                </button>
                            </div>
                        </div>
                    ))}
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
