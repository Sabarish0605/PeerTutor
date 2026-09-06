import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export default function TutorDashboard() {
    const { user } = useContext(AuthContext);

    const [categories, setCategories] = useState([]);
    const [myCourses, setMyCourses] = useState([]);
    const [isCreating, setIsCreating] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        maxPeers: 5,
        scheduleDay: '',
        scheduleTime: '',
        scheduleEndTime: '',
        thumbnailUrl: '',
        demoVideoUrl: '',
        subjectId: ''
    });

    const fetchStudioData = async () => {
        try {
            const [catsRes, coursesRes] = await Promise.all([
                api.get('/subjects'),
                api.get(`/courses/user/${user.id}`)
            ]);
            // DEFENSIVE CHECK: Ensure we only save arrays to state
            setCategories(Array.isArray(catsRes.data) ? catsRes.data : []);
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
            const res = await api.post(`/courses/user/${user.id}`, formData);
            setMyCourses([...myCourses, res.data]);
            setIsCreating(false);
            // ADDED scheduleEndTime to reset
            setFormData({ title: '', description: '', price: '', maxPeers: 5, scheduleDay: '', scheduleTime: '', scheduleEndTime: '', thumbnailUrl: '', demoVideoUrl: '', subjectId: '' });
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to publish course.');
        }
    };

    const handleDeleteCourse = async (courseId) => {
        if (!window.confirm("Are you sure you want to delete this course?")) return;
        try {
            await api.delete(`/courses/${courseId}/user/${user.id}`);
            setMyCourses(myCourses.filter(c => c.id !== courseId));
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete course.');
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 py-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tutor Studio</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Manage course offerings, batch limits, and teaching listings.</p>
                </div>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow-sm">
                    {isCreating ? 'Cancel' : 'New Course Listing'}
                </button>
            </div>

            {isCreating && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Create New Course</h2>

                    <form onSubmit={handleCreateCourse} className="space-y-4">
                        {/* THE GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Course Title</label>
                                <input type="text" placeholder="e.g. Full-Stack Spring Boot & React Mastery" required
                                       className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                       value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Description & Syllabus</label>
                                <textarea rows="3" placeholder="Outline what will be covered during the sessions..." required
                                          className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                          value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                            </div>

                            {/* SCHEDULING SECTION */}
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Day of the Week</label>
                                <select required className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                        value={formData.scheduleDay} onChange={e => setFormData({...formData, scheduleDay: e.target.value})}>
                                    <option value="">Select Day...</option>
                                    <option value="Monday">Monday</option>
                                    <option value="Tuesday">Tuesday</option>
                                    <option value="Wednesday">Wednesday</option>
                                    <option value="Thursday">Thursday</option>
                                    <option value="Friday">Friday</option>
                                    <option value="Saturday">Saturday</option>
                                    <option value="Sunday">Sunday</option>
                                </select>
                            </div>

                            {/* START & END TIME SPLIT */}
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Start Time</label>
                                    <input type="time" required
                                           className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                           value={formData.scheduleTime} onChange={e => setFormData({...formData, scheduleTime: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">End Time</label>
                                    <input type="time" required
                                           className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                           value={formData.scheduleEndTime} onChange={e => setFormData({...formData, scheduleEndTime: e.target.value})} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Price per Seat (₹)</label>
                                <input type="number" placeholder="500" required
                                       className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                       value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Max Peers per Batch</label>
                                <input type="number" min="1" max="100" placeholder="5" required
                                       className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                       value={formData.maxPeers} onChange={e => setFormData({...formData, maxPeers: e.target.value})} />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Category</label>
                                <select required className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                        value={formData.subjectId} onChange={e => setFormData({...formData, subjectId: e.target.value})}>
                                    <option value="">Select Category...</option>

                                    {/* DEFENSIVE RENDER */}
                                    {Array.isArray(categories) && categories.length > 0 ? (
                                        categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))
                                    ) : (
                                        <option value="" disabled>No categories available (Check Backend)</option>
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Thumbnail URL</label>
                                <input type="url" placeholder="https://images.unsplash.com/..."
                                       className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                       value={formData.thumbnailUrl} onChange={e => setFormData({...formData, thumbnailUrl: e.target.value})} />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Demo Video URL (YouTube / Loom)</label>
                                <input type="url" placeholder="https://youtube.com/..."
                                       className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                       value={formData.demoVideoUrl} onChange={e => setFormData({...formData, demoVideoUrl: e.target.value})} />
                            </div>
                        </div>

                        {/* SUBMIT BUTTON AT THE BOTTOM */}
                        <div className="pt-2">
                            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-sm hover:bg-blue-700 transition">
                                Publish Listing
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Active Course Listings</h2>
                {myCourses.length === 0 ? (
                    <div className="text-center p-12 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500 text-sm">
                        No active courses published. Use the listing form above to create your first course.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myCourses.map((course) => (
                            <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col justify-between">
                                <div className="h-44 bg-gray-100 relative">
                                    {course.thumbnailUrl ? (
                                        <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs uppercase font-medium">No Thumbnail</div>
                                    )}
                                    <span className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded font-medium">
                                        Max: {course.maxPeers} Peers
                                    </span>
                                </div>
                                <div className="p-5 flex-1 flex flex-col justify-between">
                                    <div>
                                        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">{course.categoryName}</span>
                                        <h3 className="text-base font-bold text-gray-900 mt-1 mb-2 line-clamp-1">{course.title}</h3>
                                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{course.description}</p>

                                        {/* NEW: Display the full schedule on the card! */}
                                        <div className="bg-blue-50 border border-blue-100 rounded p-2 mb-3">
                                            <p className="text-xs font-semibold text-blue-800 text-center">
                                                📅 Every {course.scheduleDay} • {course.scheduleTime} to {course.scheduleEndTime}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold text-gray-900 mb-3">₹{course.price}</p>
                                        <button
                                            onClick={() => handleDeleteCourse(course.id)}
                                            className="w-full bg-red-50 text-red-600 py-2 rounded-lg text-xs font-semibold hover:bg-red-100 transition">
                                            Delete Listing
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