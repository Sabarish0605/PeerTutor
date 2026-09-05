import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Home() {
    const [tutors, setTutors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch all registered tutors from the backend
        const fetchTutors = async () => {
            try {
                // Assuming your backend has a GET endpoint for tutors
                const response = await api.get('/tutors');
                setTutors(response.data);
            } catch (error) {
                console.error('Failed to fetch tutors', error);
                // For now, let's set some dummy data so you can see the UI if the endpoint isn't ready
                setTutors([
                    {
                        id: 1,
                        user: { name: "Expert Tutor" },
                        experience: "5 years of teaching Java and Spring Boot.",
                        price: 500,
                        teachingLevel: "Advanced",
                        rating: 4.8,
                        completedSessions: 12
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchTutors();
    }, []);

    return (
        <div className="max-w-6xl mx-auto">
            {/* Hero Section */}
            <div className="bg-blue-600 text-white rounded-2xl p-10 text-center mb-12 shadow-lg">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Find Your Perfect Peer Tutor</h1>
                <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                    Master new subjects with the help of experienced peers. Book a session today and elevate your learning.
                </p>
                <Link to="/register">
                    <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-100 transition shadow-md">
                        Start Learning Now
                    </button>
                </Link>
            </div>

            {/* Tutors Grid */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Top Rated Tutors</h2>

            {loading ? (
                <div className="text-center text-gray-500 py-10">Loading awesome tutors...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tutors.map((tutor, index) => (
                        <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition flex flex-col h-full">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{tutor.user?.name || "Tutor"}</h3>
                                    <p className="text-sm text-blue-600 font-medium">{tutor.teachingLevel} Level</p>
                                </div>
                                <div className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-sm font-bold flex items-center">
                                    ⭐ {tutor.rating || "New"}
                                </div>
                            </div>

                            <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-3">
                                {tutor.experience}
                            </p>

                            <div className="flex justify-between items-center border-t pt-4 mt-auto">
                                <span className="font-bold text-gray-800">₹{tutor.price} <span className="text-sm font-normal text-gray-500">/ session</span></span>
                                <Link to={`/tutor/${tutor.id}`}>
                                    <button className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition">
                                        View Profile
                                    </button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}