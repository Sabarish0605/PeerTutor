import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

export default function TutorProfileSetup() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState([]);
    const [formData, setFormData] = useState({
        experience: '',
        price: '',
        teachingLevel: 'Beginner',
        upiId: '',
        subjectIds: []
    });

    // Fetch master subjects from the database so the tutor can choose
    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const response = await api.get('/subjects');
                setSubjects(response.data);
            } catch (error) {
                console.error('Failed to fetch subjects', error);
            }
        };
        fetchSubjects();
    }, []);

    // Handle checkbox toggles for subjects
    const handleSubjectChange = (e) => {
        const subjectId = parseInt(e.target.value);
        if (e.target.checked) {
            setFormData({ ...formData, subjectIds: [...formData.subjectIds, subjectId] });
        } else {
            setFormData({ ...formData, subjectIds: formData.subjectIds.filter(id => id !== subjectId) });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Send the data to the backend endpoint we created earlier
            await api.post(`/tutors/profile/${user.id}`, {
                ...formData,
                price: parseFloat(formData.price) // Ensure price is a decimal/float
            });
            alert('Profile saved successfully!');
            navigate('/tutor/dashboard');
        } catch (error) {
            alert('Error saving profile. You might have already set it up!');
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Complete Your Tutor Profile</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teaching Experience</label>
                    <textarea
                        value={formData.experience}
                        onChange={(e) => setFormData({...formData, experience: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        rows="3"
                        placeholder="Tell students about your background..."
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price per Session (₹)</label>
                        <input
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({...formData, price: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="e.g. 500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teaching Level</label>
                        <select
                            value={formData.teachingLevel}
                            onChange={(e) => setFormData({...formData, teachingLevel: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded-md bg-white">
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID (For Payments)</label>
                    <input
                        type="text"
                        value={formData.upiId}
                        onChange={(e) => setFormData({...formData, upiId: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="e.g. yourname@okhdfcbank"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subjects You Can Teach</label>
                    <div className="grid grid-cols-2 gap-2 p-4 border border-gray-200 rounded-md bg-gray-50">
                        {subjects.map(subject => (
                            <label key={subject.id} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    value={subject.id}
                                    onChange={handleSubjectChange}
                                    className="rounded text-blue-600 focus:ring-blue-500"
                                />
                                <span>{subject.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <button type="submit" className="w-full bg-green-600 text-white p-3 rounded-md hover:bg-green-700 transition font-bold">
                    Save Profile & Start Teaching
                </button>
            </form>
        </div>
    );
}