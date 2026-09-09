import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';

export default function TutorOnboarding() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        bio: '',
        experience: '',
        upiId: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/tutors/onboard', formData);
            // Upgrade role in context
            login(response.data, response.data.token);
            toast.success('Successfully upgraded to Tutor!');
            navigate('/tutor/dashboard');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to upgrade to tutor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto mt-20 p-8 bg-[#F8F9FA] border border-gray-100 rounded-3xl shadow-sm relative z-10">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">Share Your Knowledge</h2>
            <p className="text-gray-500 mb-8 text-center font-medium">Become a tutor, help your peers, and start earning on your own schedule.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Bio</label>
                    <textarea
                        required
                        rows="3"
                        className="w-full p-4 bg-[#F8F9FA] border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder-gray-400 font-medium"
                        placeholder="Tell students about yourself..."
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Subjects of Expertise &amp; Experience</label>
                    <textarea
                        required
                        rows="3"
                        className="w-full p-4 bg-[#F8F9FA] border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder-gray-400 font-medium"
                        placeholder="E.g., 2 years tutoring Calculus, top 5% in Physics..."
                        value={formData.experience}
                        onChange={(e) => setFormData({...formData, experience: e.target.value})}
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">UPI ID (For Payments)</label>
                    <input
                        required
                        type="text"
                        className="w-full p-4 bg-[#F8F9FA] border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder-gray-400 font-medium"
                        placeholder="yourname@upi"
                        value={formData.upiId}
                        onChange={(e) => setFormData({...formData, upiId: e.target.value})}
                    />
                </div>
                
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-sm disabled:opacity-50"
                >
                    {loading ? 'Upgrading...' : 'Upgrade to Tutor'}
                </button>
            </form>
        </div>
    );
}
