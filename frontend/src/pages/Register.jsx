import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export default function Register() {
    // We removed 'role' from the state because the backend handles it automatically now!
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await api.post('/auth/register', formData);
            login(response.data, response.data.token);

            // Everyone goes straight to the Student Dashboard now!
            navigate('/student/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Email might already be in use.');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 bg-white p-8 border border-gray-200 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">Create an Account</h2>

            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" required
                    />
                </div>

                {/* The dropdown was completely removed from here! */}

                <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition font-medium">
                    Register
                </button>
            </form>
            <div className="mt-4 text-center text-sm">
                Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login here</Link>
            </div>
        </div>
    );
}