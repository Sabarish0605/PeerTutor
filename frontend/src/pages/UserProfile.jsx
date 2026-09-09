import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Edit2, Check, Plus, ArrowRight, Star } from 'lucide-react';

export default function UserProfile() {
    const { id } = useParams();
    const { user, login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscribing, setSubscribing] = useState(false);
    
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', fieldOfStudy: '', bio: '', avatarUrl: '' });
    const [uploading, setUploading] = useState(false);

    const isOwnProfile = user?.id === parseInt(id);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get(`/users/public/${id}`);
                setProfile(res.data);
                
                if (isOwnProfile) {
                    setEditForm({
                        name: res.data.name || '',
                        fieldOfStudy: res.data.fieldOfStudy || '',
                        bio: res.data.bio || '',
                        avatarUrl: res.data.avatarUrl || ''
                    });
                }

                if (!isOwnProfile && user?.id) {
                    const subRes = await api.get(`/subscriptions/check/student/${user.id}/tutor/${id}`);
                    setIsSubscribed(subRes.data.subscribed);
                }

                const coursesRes = await api.get(`/courses/user/${id}`);
                setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : []);
                setProfile(prev => ({ ...prev, coursesCount: coursesRes.data.length }));

            } catch (err) {
                console.error("Failed to fetch profile", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [id, user, isOwnProfile]);

    const handleSubscribe = async () => {
        if (!user) {
            toast.error("Please log in to subscribe.");
            navigate('/login');
            return;
        }

        setSubscribing(true);
        try {
            const res = await api.post(`/subscriptions/student/${user.id}/tutor/${id}`);
            setIsSubscribed(res.data.subscribed);
            if (res.data.subscribed) {
                setProfile(prev => ({ ...prev, subscribersCount: prev.subscribersCount + 1 }));
                toast.success("Subscribed!");
            } else {
                setProfile(prev => ({ ...prev, subscribersCount: prev.subscribersCount - 1 }));
                toast.success("Unsubscribed successfully.");
            }
        } catch (error) {
            console.error("Failed to toggle subscription", error);
            toast.error("Subscription failed.");
        } finally {
            setSubscribing(false);
        }
    };

    const handleSaveProfile = async () => {
        try {
            const res = await api.put('/users/me', {
                fullName: editForm.name,
                fieldOfStudy: editForm.fieldOfStudy,
                bio: editForm.bio,
                avatarUrl: editForm.avatarUrl
            });
            setProfile(prev => ({
                ...prev,
                name: res.data.name,
                fieldOfStudy: res.data.fieldOfStudy,
                bio: res.data.bio,
                avatarUrl: res.data.profileImage
            }));
            
            login(res.data, localStorage.getItem('token'));
            setIsEditing(false);
            toast.success("Profile updated successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile");
        }
    };
    
    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        setUploading(true);
        try {
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setEditForm(prev => ({ ...prev, avatarUrl: res.data.url }));
            toast.success("Image uploaded!");
        } catch (error) {
            console.error(error);
            toast.error("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="text-center py-20 text-gray-500 font-sans text-sm animate-pulse">Loading profile data...</div>;

    return (
        <div className="flex flex-col w-full max-w-5xl mx-auto pt-6 px-4 pb-16 font-sans">
            {/* Top Navigation */}
            <div className="flex items-center justify-between mb-6">
                <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-200 px-3.5 py-2 rounded-lg hover:border-gray-300 hover:text-gray-900 transition-all shadow-sm">
                    <ArrowLeft size={16} />
                    <span>Back</span>
                </button>
            </div>

            {/* Profile Card */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 mb-8 text-center relative overflow-hidden">
                <div className="relative z-10 flex flex-col items-center pt-2">
                    {/* Avatar Area */}
                    <div className="relative mb-4">
                        {isEditing ? (
                            <div className="relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-gray-100 shadow-md bg-gray-50">
                                {editForm.avatarUrl ? (
                                    <img src={editForm.avatarUrl} alt="Avatar" className="w-full h-full object-cover opacity-50" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-4xl">
                                        {editForm.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <label className="text-white text-xs font-semibold cursor-pointer text-center bg-black/60 px-3 py-1.5 rounded-full hover:bg-black/70 transition-colors">
                                        {uploading ? 'Uploading...' : 'Upload Image'}
                                        <input type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" disabled={uploading} />
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <div className="relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-gray-100 shadow-md bg-gray-50">
                                {profile?.avatarUrl ? (
                                    <img src={profile.avatarUrl} alt={profile?.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-4xl bg-gray-100">
                                        {profile?.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Identity & Institution */}
                    {isEditing ? (
                        <div className="flex flex-col items-center gap-3 w-full max-w-md mb-6">
                            <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg text-center font-bold text-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Your Name" />
                            <input type="text" value={editForm.fieldOfStudy} onChange={e => setEditForm({...editForm, fieldOfStudy: e.target.value})} className="w-full p-2 bg-gray-50 border border-gray-300 text-gray-600 text-sm rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Field of Study (e.g. Computer Science)" />
                            <textarea value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Bio..." rows="3" />
                        </div>
                    ) : (
                        <>
                            <h1 className="text-2xl md:text-3xl text-gray-900 font-bold tracking-tight mb-1">{profile?.name}</h1>
                            <p className="text-sm font-medium text-blue-600 mb-4 uppercase tracking-wide">
                                {profile?.fieldOfStudy || 'Peer Learner'}
                            </p>
                            <p className="text-base text-gray-600 max-w-xl leading-relaxed mb-8">
                                {profile?.bio || 'Let\'s conquer complex systems together!'}
                            </p>
                        </>
                    )}

                    {/* Stats Metric Bar */}
                    <div className="flex flex-wrap items-center justify-center gap-8 py-4 px-8 rounded-xl bg-gray-50 border border-gray-200 mb-8 shadow-sm w-full max-w-2xl">
                        <div className="flex flex-col items-center">
                            <span className="text-2xl text-gray-900 font-bold">{profile?.subscribersCount || 0}</span>
                            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Subscribers</span>
                        </div>
                        <div className="w-px h-10 bg-gray-200 hidden sm:block"></div>
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1.5">
                                <span className="text-xl text-gray-900 font-bold">{profile?.avgRating || "0.0"}</span>
                                <Star size={18} className="text-yellow-400 fill-yellow-400" />
                            </div>
                            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Rating</span>
                        </div>
                        <div className="w-px h-10 bg-gray-200 hidden sm:block"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-2xl text-gray-900 font-bold">{profile?.coursesCount || 0}</span>
                            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Courses</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        {isOwnProfile ? (
                            isEditing ? (
                                <>
                                    <button onClick={() => setIsEditing(false)} className="inline-flex items-center gap-2 bg-white text-gray-700 text-sm font-medium px-5 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all">Cancel</button>
                                    <button onClick={handleSaveProfile} className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold px-7 py-2.5 rounded-lg shadow-md transition-all">Save Profile</button>
                                </>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="inline-flex items-center gap-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 text-sm font-medium px-5 py-2.5 rounded-lg transition-all shadow-sm">
                                    <Edit2 size={16} />
                                    <span>Edit Profile</span>
                                </button>
                            )
                        ) : (
                            <button 
                                onClick={handleSubscribe} 
                                disabled={subscribing}
                                className={isSubscribed 
                                    ? "inline-flex items-center gap-2 bg-gray-100 border border-gray-300 text-gray-700 text-sm font-semibold px-7 py-2.5 rounded-lg transition-all"
                                    : "inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold px-7 py-2.5 rounded-lg shadow-md transition-all active:scale-[0.98]"}
                            >
                                {isSubscribed ? <Check size={18} /> : <Plus size={18} />}
                                <span>{isSubscribed ? 'Subscribed' : `Subscribe to ${profile?.name?.split(' ')[0]}`}</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Courses Section Header */}
            <div className="flex items-center justify-between mb-6 mt-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl text-gray-900 font-bold">Courses by {profile?.name?.split(' ')[0]}</h2>
                    <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">{courses.length} Available</span>
                </div>
            </div>

            {/* Course Cards Grid */}
            {courses.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500 text-sm">
                    No courses published yet.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {courses.map(course => (
                        <div key={course.id} className="bg-white border border-gray-200 hover:border-gray-300 rounded-xl shadow-sm transition-all flex flex-col justify-between overflow-hidden group hover:shadow-md">
                            <div>
                                <div className="relative w-full aspect-video bg-gray-100 overflow-hidden border-b border-gray-200">
                                    {course.thumbnailUrl ? (
                                        <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-semibold tracking-wider uppercase bg-gray-50">No Preview</div>
                                    )}
                                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md shadow-sm border border-gray-100">
                                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                        <span className="text-[11px] text-gray-700 font-semibold">{course.categoryName}</span>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="text-lg text-gray-900 font-bold mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                                        {course.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                                        {course.description}
                                    </p>
                                </div>
                            </div>
                            <div className="p-5 pt-0 flex items-center justify-between border-t border-gray-100 pt-4">
                                <div>
                                    <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-semibold mb-0.5">Price</span>
                                    <span className="text-xl text-gray-900 font-bold">${course.price}</span>
                                </div>
                                <Link to={`/discover`} className="inline-flex items-center gap-1.5 text-sm text-white font-medium bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded-xl transition-all shadow-sm">
                                    <span>View Details</span>
                                    <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
