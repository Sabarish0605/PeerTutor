import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export default function TutorProfileSetup() {
    const { user, login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        experience: '',
        upiId: '',
        price: 0,
        teachingLevel: 'Beginner',
        subjectIds: []
    });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await api.post(`/tutors/profile/${user.id}`, formData);

            // Immediately sync updated role in local storage
            const updatedUser = { ...user, role: 'TUTOR' };
            const currentToken = localStorage.getItem('token');
            login(updatedUser, currentToken);

            navigate('/tutor/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to initialize Tutor Studio. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto mt-12 bg-white p-8 border border-gray-200 rounded-xl shadow-sm">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Initialize Tutor Studio</h2>
                <p className="text-sm text-gray-500 mt-1">
                    Complete your instructor profile to start creating and managing course batches.
                </p>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-md mb-5 text-sm font-medium">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Teaching Background & Bio</label>
                    <textarea
                        required rows="4"
                        placeholder="Detail your professional experience, qualifications, and domain expertise..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
                        value={formData.experience}
                        onChange={e => setFormData({...formData, experience: e.target.value})}
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">UPI ID for Direct Payouts</label>
                    <input
                        required type="text"
                        placeholder="e.g. username@okhdfcbank"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
                        value={formData.upiId}
                        onChange={e => setFormData({...formData, upiId: e.target.value})}
                    />
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-sm hover:bg-blue-700 transition disabled:opacity-50 shadow-sm">
                    {submitting ? 'Setting up Studio...' : 'Complete Setup & Open Studio'}
                </button>
            </form>
        </div>
    );
}