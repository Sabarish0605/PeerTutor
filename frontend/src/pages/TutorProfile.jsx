import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export default function TutorProfile() {
    const { id } = useParams(); // Gets the tutor ID from the URL
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [tutor, setTutor] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedSlot, setSelectedSlot] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In a full app, we would fetch the exact tutor and their available slots from the backend here.
        // For now, we will mock the data so we can build the UI!
        const fetchTutorDetails = async () => {
            setTimeout(() => {
                setTutor({
                    id: id,
                    user: { name: "Expert Tutor" },
                    experience: "5 years of teaching Java and Spring Boot.",
                    price: 500,
                    teachingLevel: "Advanced",
                    rating: 4.8,
                    completedSessions: 12,
                    subjects: [
                        { id: 1, name: "Java (Spring Boot)" },
                        { id: 2, name: "React JS" }
                    ],
                    availableSlots: [
                        { id: 101, dayOfWeek: "MONDAY", startTime: "10:00", endTime: "11:00" },
                        { id: 102, dayOfWeek: "WEDNESDAY", startTime: "15:00", endTime: "16:00" }
                    ]
                });
                setLoading(false);
            }, 500);
        };
        fetchTutorDetails();
    }, [id]);

    const handleBooking = async (e) => {
        e.preventDefault();

        if (!user || user.role !== 'STUDENT') {
            alert("Please log in as a student to book a session!");
            navigate('/login');
            return;
        }

        try {
            // This hits the BookingController we created in Phase 7!
            await api.post(`/bookings/student/${user.id}`, {
                tutorId: tutor.id,
                subjectId: selectedSubject,
                availabilityId: selectedSlot,
                sessionDate: selectedDate
            });

            alert('Booking confirmed successfully! 🎉');
            navigate('/student/dashboard');
        } catch (error) {
            console.error(error);
            alert('Failed to book session. Please try again.');
        }
    };

    if (loading) return <div className="text-center mt-10">Loading profile...</div>;

    return (
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Left Column: Tutor Info */}
            <div className="md:col-span-2 space-y-6">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{tutor.user.name}</h1>
                            <p className="text-lg text-blue-600 font-medium mt-1">{tutor.teachingLevel} Level Tutor</p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">₹{tutor.price}</div>
                            <div className="text-sm text-gray-500">per session</div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-6 pb-6 border-b">
                        <span className="flex items-center">⭐ {tutor.rating} ({tutor.completedSessions} sessions)</span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">About Me</h3>
                    <p className="text-gray-600 leading-relaxed">{tutor.experience}</p>
                </div>
            </div>

            {/* Right Column: Booking Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit sticky top-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Book a Session</h2>
                <form onSubmit={handleBooking} className="space-y-4">

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Subject</label>
                        <select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md bg-white" required>
                            <option value="">-- Choose Subject --</option>
                            {tutor.subjects.map(sub => (
                                <option key={sub.id} value={sub.id}>{sub.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Session Date</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md" required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Available Time Slots</label>
                        <select
                            value={selectedSlot}
                            onChange={(e) => setSelectedSlot(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md bg-white" required>
                            <option value="">-- Choose Slot --</option>
                            {tutor.availableSlots.map(slot => (
                                <option key={slot.id} value={slot.id}>
                                    {slot.dayOfWeek} at {slot.startTime}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition font-bold mt-2">
                        Confirm Booking
                    </button>
                </form>
            </div>
        </div>
    );
}