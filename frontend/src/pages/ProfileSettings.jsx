import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';

export default function ProfileSettings() {
    const { user, login } = useContext(AuthContext); // Need login to update context state
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        fullName: '',
        bio: '',
        fieldOfStudy: '',
        avatarUrl: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.name || '',
                bio: user.bio || '',
                fieldOfStudy: user.fieldOfStudy || '',
                avatarUrl: user.profileImage || ''
            });
        }
    }, [user]);

    const handleFileUpload = async (e, field) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append("file", file);

        setLoading(true);
        try {
            const res = await api.post('/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, [field]: res.data.url }));
            toast.success("File uploaded successfully!");
        } catch (error) {
            console.error("Upload failed", error);
            toast.error("Failed to upload file.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Send PUT request to update user profile
            const res = await api.put('/users/me', formData);
            toast.success("Profile updated successfully!");
            
            // Re-login/update context with the new data while preserving token
            login(res.data, localStorage.getItem('token'));
        } catch (error) {
            console.error("Failed to update profile", error);
            toast.error(error.response?.data?.message || "Failed to save profile changes.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-900 mb-6 gap-2 font-medium">
                <ArrowLeft size={16} /> Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile Settings</h1>

            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200 max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                        <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                            className="w-full bg-gray-100 border border-gray-300 text-gray-900 rounded-lg outline-none px-4 py-3 font-medium focus:ring-2 focus:ring-gray-500 transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Avatar Image</label>
                        <div className="flex items-center gap-4">
                            {formData.avatarUrl && (
                                <img src={formData.avatarUrl} alt="Avatar Preview" className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, 'avatarUrl')}
                                className="w-full bg-gray-100 border border-gray-300 text-gray-900 rounded-lg outline-none px-4 py-3 font-medium focus:ring-2 focus:ring-gray-500 transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Field of Study</label>
                        <input
                            type="text"
                            value={formData.fieldOfStudy}
                            onChange={(e) => setFormData({...formData, fieldOfStudy: e.target.value})}
                            className="w-full bg-gray-100 border border-gray-300 text-gray-900 rounded-lg outline-none px-4 py-3 font-medium focus:ring-2 focus:ring-gray-500 transition-all"
                            placeholder="e.g. Computer Science, Mathematics"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Bio</label>
                        <textarea
                            rows="4"
                            value={formData.bio}
                            onChange={(e) => setFormData({...formData, bio: e.target.value})}
                            className="w-full bg-gray-100 border border-gray-300 text-gray-900 rounded-lg outline-none px-4 py-3 font-medium focus:ring-2 focus:ring-gray-500 transition-all"
                            placeholder="Tell us a little about yourself..."
                        />
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-gray-800 text-white font-bold py-3 px-6 rounded-xl hover:bg-gray-900 transition-colors disabled:opacity-50 shadow-sm"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
