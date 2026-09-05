import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function TutorDashboard() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Welcome to your workspace, {user?.name}! 🎓</h1>
                    <p className="text-gray-500">Manage your students, schedule, and earnings.</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="bg-red-50 text-red-600 px-4 py-2 rounded-md font-medium hover:bg-red-100 transition">
                    Logout
                </button>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Profile & Stats Card */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">My Profile</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-600">Status</span>
                            <span className="text-green-600 font-medium">Active</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-600">Reputation Score</span>
                            <span className="font-medium text-gray-800">New Tutor</span>
                        </div>
                        <div className="flex justify-between pb-2">
                            <span className="text-gray-600">Completed Sessions</span>
                            <span className="font-medium text-gray-800">0</span>
                        </div>
                    </div>
                    <Link to="/tutor/setup">
                        <button className="w-full mt-4 bg-blue-50 text-blue-600 py-2 rounded-md font-medium hover:bg-blue-100 transition">
                            Set Up Tutor Profile
                        </button>
                    </Link>
                </div>

                {/* Upcoming Schedule Card */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Upcoming Sessions</h2>
                    <div className="text-center p-6 bg-gray-50 rounded border border-dashed border-gray-300 text-gray-500">
                        No upcoming sessions booked yet.
                    </div>
                    <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition">
                        Manage Availability
                    </button>
                </div>

            </div>
        </div>
    );
}
