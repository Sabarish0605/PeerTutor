import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Plus, X, Edit2, ChevronDown, Trash2, Upload, PlayCircle, Link as LinkIcon, Users, Eye, Image } from 'lucide-react';

export default function TutorDashboard() {
    const { user } = useContext(AuthContext);

    const CS_CATEGORIES = [
        "Software Development", "Databases", "Cloud & DevOps", 
        "Cybersecurity", "Networking", "AI & Machine Learning", 
        "Data Science", "Hardware & Systems"
    ];

    const [myCourses, setMyCourses] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [slots, setSlots] = useState([{ date: '', time: '' }]);

    const [selectedCourseRoster, setSelectedCourseRoster] = useState(null);
    const [rosterData, setRosterData] = useState([]);
    const [loadingRoster, setLoadingRoster] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        maxPeers: 5,
        thumbnailUrl: '',
        demoVideoUrl: '',
        meetLink: '',
        categoryName: ''
    });

    const fetchStudioData = async () => {
        try {
            const coursesRes = await api.get(`/courses/user/${user.id}`);
            setMyCourses(Array.isArray(coursesRes.data) ? coursesRes.data : []);
        } catch (error) {
            console.error("Failed to load studio data", error);
        }
    };

    useEffect(() => {
        if (user?.id) {
            fetchStudioData();
        }
    }, [user]);

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        try {
            const formattedSlots = slots
                .filter(s => s.date && s.time)
                .map(s => ({
                    slotDateTime: `${s.date}T${s.time}:00`,
                    maxSeats: parseInt(formData.maxPeers)
                }));
                
            if (formattedSlots.length === 0) {
                toast.error('Please add at least one valid slot.');
                return;
            }

            const payload = { ...formData, slots: formattedSlots };
            const res = await api.post(`/courses/user/${user.id}`, payload);
            setMyCourses([...myCourses, res.data]);
            setIsCreating(false);
            setFormData({ title: '', description: '', price: '', maxPeers: 5, thumbnailUrl: '', demoVideoUrl: '', meetLink: '', categoryName: '' });
            setSlots([{ date: '', time: '' }]);
            toast.success("Course published successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to publish course.');
        }
    };

    const handleDeleteCourse = async (courseId) => {
        if (!window.confirm("Are you sure you want to delete this course?")) return;
        try {
            await api.delete(`/courses/${courseId}/user/${user.id}`);
            setMyCourses(myCourses.filter(c => c.id !== courseId));
            toast.success('Course deleted successfully.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete course.');
        }
    };

    const handleViewRoster = async (course) => {
        setSelectedCourseRoster(course);
        setLoadingRoster(true);
        try {
            const response = await api.get(`/bookings/course/${course.id}`);
            setRosterData(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Failed to fetch roster", error);
            toast.error("Could not load the student roster.");
        } finally {
            setLoadingRoster(false);
        }
    };

    return (
        <div className="flex flex-col w-full max-w-6xl mx-auto pt-8 px-4 pb-16 font-sans">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl text-gray-900 font-bold tracking-tight mb-2">Tutor Studio</h1>
                    <p className="text-sm md:text-base text-gray-600">Create courses, manage schedules, and view your students.</p>
                </div>
                <button 
                    onClick={() => setIsCreating(!isCreating)} 
                    className={isCreating 
                        ? "inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-all bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                        : "bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl px-4 py-2 flex items-center justify-center gap-2 transition-colors"}
                >
                    {isCreating ? <X size={18} /> : <Plus size={18} />}
                    <span>{isCreating ? 'Cancel Creation' : 'Create New Course'}</span>
                </button>
            </div>

            {/* Create Course Form */}
            {isCreating && (
                <div className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden mb-10">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
                        <Edit2 size={18} className="text-blue-600" />
                        <span className="font-semibold text-gray-800">Course Details</span>
                    </div>
                    
                    <form onSubmit={handleCreateCourse} className="p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Course Title</label>
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full bg-white text-gray-900 placeholder:text-gray-400 text-sm rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                                        placeholder="e.g. Advanced State Management in React" 
                                        value={formData.title} 
                                        onChange={e => setFormData({...formData, title: e.target.value})} 
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                                    <textarea 
                                        rows="4" 
                                        required
                                        className="w-full bg-white text-gray-900 placeholder:text-gray-400 text-sm rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                                        placeholder="What will students learn?" 
                                        value={formData.description} 
                                        onChange={e => setFormData({...formData, description: e.target.value})} 
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                                        <div className="relative">
                                            <select 
                                                required 
                                                className="w-full bg-white text-gray-900 text-sm rounded-lg border border-gray-300 pl-4 pr-10 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none"
                                                value={formData.categoryName} 
                                                onChange={e => setFormData({...formData, categoryName: e.target.value})}
                                            >
                                                <option value="" disabled>Select Category...</option>
                                                {CS_CATEGORIES.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Price ($)</label>
                                        <input 
                                            type="number" 
                                            min="0"
                                            required
                                            className="w-full bg-white text-gray-900 placeholder:text-gray-400 text-sm rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                                            placeholder="50" 
                                            value={formData.price} 
                                            onChange={e => setFormData({...formData, price: e.target.value})} 
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Max Students Per Class</label>
                                    <input 
                                        type="number" 
                                        min="1" 
                                        max="50" 
                                        required
                                        className="w-full bg-white text-gray-900 placeholder:text-gray-400 text-sm rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                                        placeholder="5" 
                                        value={formData.maxPeers} 
                                        onChange={e => setFormData({...formData, maxPeers: e.target.value})} 
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Schedule Classes</label>
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                                        {slots.map((slot, index) => (
                                            <div key={index} className="flex gap-2 items-center">
                                                <input 
                                                    type="date" 
                                                    required
                                                    className="flex-1 bg-white text-gray-900 text-sm rounded border border-gray-300 px-3 py-2 focus:outline-none focus:border-blue-500" 
                                                    value={slot.date} 
                                                    onChange={e => {
                                                        const newSlots = [...slots];
                                                        newSlots[index].date = e.target.value;
                                                        setSlots(newSlots);
                                                    }} 
                                                />
                                                <input 
                                                    type="time" 
                                                    required
                                                    className="flex-1 bg-white text-gray-900 text-sm rounded border border-gray-300 px-3 py-2 focus:outline-none focus:border-blue-500" 
                                                    value={slot.time} 
                                                    onChange={e => {
                                                        const newSlots = [...slots];
                                                        newSlots[index].time = e.target.value;
                                                        setSlots(newSlots);
                                                    }} 
                                                />
                                                {slots.length > 1 && (
                                                    <button type="button" onClick={() => setSlots(slots.filter((_, i) => i !== index))} className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors">
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button type="button" onClick={() => setSlots([...slots, { date: '', time: '' }])} className="w-full mt-2 inline-flex justify-center items-center gap-2 text-sm text-gray-600 bg-white hover:bg-gray-50 border border-gray-300 border-dashed px-3 py-2 rounded font-medium transition-all">
                                            <Plus size={16} /> Add Time Block
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Course Thumbnail</label>
                                    <div className="flex flex-col gap-3">
                                        {formData.thumbnailUrl && (
                                            <div className="w-full aspect-video rounded-lg overflow-hidden border border-gray-200 relative">
                                                <img src={formData.thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <label className="w-full flex items-center justify-center gap-2 bg-gray-50 text-gray-500 hover:text-blue-600 hover:bg-blue-50 text-sm rounded-lg border border-gray-300 hover:border-blue-300 border-dashed px-4 py-4 cursor-pointer font-medium transition-all">
                                            <Upload size={18} />
                                            <span>{formData.thumbnailUrl ? 'Change Thumbnail' : 'Upload Thumbnail'}</span>
                                            <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (!file) return;
                                                const uploadData = new FormData();
                                                uploadData.append("file", file);
                                                try {
                                                    const res = await api.post('/upload', uploadData, { headers: { 'Content-Type': 'multipart/form-data' } });
                                                    setFormData({ ...formData, thumbnailUrl: res.data.url });
                                                    toast.success("Image uploaded!");
                                                } catch (error) {
                                                    toast.error("Upload failed.");
                                                }
                                            }} />
                                        </label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Meeting Link</label>
                                        <input 
                                            type="url" 
                                            required
                                            className="w-full bg-white text-gray-900 placeholder:text-gray-400 text-sm rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                                            placeholder="https://meet.google.com/..." 
                                            value={formData.meetLink} 
                                            onChange={e => setFormData({...formData, meetLink: e.target.value})} 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Demo Video (Optional)</label>
                                        <input 
                                            type="url" 
                                            className="w-full bg-white text-gray-900 placeholder:text-gray-400 text-sm rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                                            placeholder="https://youtube.com/..." 
                                            value={formData.demoVideoUrl} 
                                            onChange={e => setFormData({...formData, demoVideoUrl: e.target.value})} 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 mt-8 border-t border-gray-200">
                            <button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl px-4 py-3 flex items-center justify-center gap-2 transition-colors">
                                <Plus size={18} />
                                <span>Publish Course</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Active Listings Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl text-gray-900 font-bold">Your Active Courses</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">{myCourses.length} Published</span>
            </div>

            {myCourses.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500 text-sm">
                    You haven't created any courses yet.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {myCourses.map((course) => (
                        <div key={course.id} className="bg-white border border-gray-200 hover:border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group">
                            <div>
                                <div className="relative w-full aspect-video bg-gray-100 overflow-hidden border-b border-gray-200">
                                    {course.thumbnailUrl ? (
                                        <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-semibold tracking-wider uppercase bg-gray-50">No Preview</div>
                                    )}
                                    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/95 border border-gray-200 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                        <span className="text-[10px] text-gray-700 font-semibold uppercase tracking-wider">Live</span>
                                    </div>
                                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white/95 border border-gray-200 backdrop-blur-sm px-2.5 py-1 rounded-md shadow-sm">
                                        <Users size={14} className="text-gray-500" />
                                        <span className="text-xs text-gray-700 font-semibold">Max: {course.maxPeers}</span>
                                    </div>
                                </div>
                                
                                <div className="p-5">
                                    <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider block mb-1">{course.categoryName}</span>
                                    <h3 className="text-lg text-gray-900 font-bold mb-3 group-hover:text-blue-600 transition-colors line-clamp-1">
                                        {course.title}
                                    </h3>
                                    
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-h-32 overflow-y-auto">
                                        <div className="text-[10px] text-gray-500 font-semibold mb-2 uppercase tracking-wider">SCHEDULED SESSIONS:</div>
                                        {course.slots?.length > 0 ? (
                                            <div className="flex flex-col gap-2">
                                                {course.slots.map(slot => (
                                                    <div key={slot.id} className="flex justify-between items-center bg-white border border-gray-200 rounded p-2 text-xs font-medium text-gray-700">
                                                        <span>{new Date(slot.slotDateTime).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}</span>
                                                        <span className={slot.currentEnrolled >= slot.maxSeats ? "text-red-500 font-bold" : "text-green-600 font-bold"}>
                                                            {slot.currentEnrolled}/{slot.maxSeats} Booked
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-500 italic">No scheduled blocks</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-5 pt-0 border-t border-gray-100 pt-4 flex flex-col gap-3 mt-auto">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xl text-gray-900 font-bold">${course.price}</span>
                                    <span className="text-xs text-gray-500 font-semibold uppercase">Per Student</span>
                                </div>
                                <button onClick={() => handleViewRoster(course)} className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 py-2.5 rounded-lg transition-all">
                                    <Eye size={16} /> View Students
                                </button>
                                <button onClick={() => handleDeleteCourse(course.id)} className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 py-2 rounded-lg transition-all">
                                    <Trash2 size={16} /> Delete Course
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Roster View Modal/Section */}
            {selectedCourseRoster && (
                <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 mt-4 relative animate-in fade-in slide-in-from-bottom-4 duration-300 mb-12">
                    <button onClick={() => setSelectedCourseRoster(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1">
                        <X size={20} />
                    </button>
                    <div className="mb-6">
                        <h3 className="text-lg text-gray-900 font-bold flex items-center gap-2">
                            <Users size={20} className="text-blue-600" />
                            Student Roster
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Viewing enrollments for: <span className="font-semibold text-gray-700">{selectedCourseRoster.title}</span></p>
                    </div>

                    {loadingRoster ? (
                        <div className="py-8 text-center text-gray-500 text-sm animate-pulse">Loading students...</div>
                    ) : rosterData.length === 0 ? (
                        <div className="py-8 text-center text-gray-500 text-sm bg-gray-50 rounded-lg border border-gray-200">No students enrolled yet.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {rosterData.map(booking => (
                                <div key={booking.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col gap-2 shadow-sm">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm text-gray-900 font-bold">{booking.student.name}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{booking.student.email}</p>
                                        </div>
                                        <span className="text-[10px] bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded uppercase font-semibold">Enrolled</span>
                                    </div>
                                    <div className="text-xs text-gray-600 bg-white p-2 rounded border border-gray-100 mt-1">
                                        <span className="font-semibold">Session: </span>
                                        {new Date(booking.slot?.slotDateTime).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
