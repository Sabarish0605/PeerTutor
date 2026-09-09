import { useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Clock, Briefcase } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function LandingPage() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            if (user.role === 'TUTOR') {
                navigate('/tutor/dashboard');
            } else {
                navigate('/discover');
            }
        }
    }, [user, navigate]);

    if (user) return null;

    return (
        <div className="relative min-h-screen w-full overflow-hidden flex flex-col justify-center">
            {/* Simple Top Navigation for Landing Page */}
            <header className="absolute top-0 w-full p-6 flex justify-between items-center">
                <div className="font-extrabold text-2xl tracking-tight text-gray-900">PeerTutor</div>
                <div className="flex gap-4">
                    <Link to="/login" className="text-gray-600 font-medium hover:text-gray-900 transition-colors py-2">
                        Log In
                    </Link>
                    <Link to="/register" className="bg-gray-800 text-white font-medium px-6 py-2 rounded-xl hover:bg-gray-900 transition-all shadow-sm">
                        Sign Up
                    </Link>
                </div>
            </header>

            <main className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col items-center justify-center py-20">
                {/* The Hero Container */}
                <div className="flex flex-col items-center justify-center mt-10">

                    <h1 className="text-5xl md:text-7xl font-extrabold text-center tracking-tight mb-6 text-gray-900 leading-tight">
                        Master Any Subject <br className="hidden md:block"/> with PeerTutor
                    </h1>

                    <p className="text-gray-700 text-center max-w-2xl mb-10 text-lg md:text-xl font-medium">
                        Join the ultimate marketplace for student-to-student learning. Affordable tutoring, flexible schedules, and real results.
                    </p>

                    <div className="flex flex-row items-center gap-4">
                        <Link to="/register" className="bg-gray-800 text-white font-medium px-8 py-4 rounded-xl hover:bg-gray-900 transition-all shadow-md text-lg">
                            Get Started for Free
                        </Link>
                    </div>
                </div>

                {/* Highlights Section */}
                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
                    {/* Highlight 1 */}
                    <div className="bg-gray-100 rounded-3xl p-8 hover:-translate-y-1 transition-all duration-300 text-center flex flex-col items-center shadow-sm border border-gray-300">
                        <div className="w-14 h-14 rounded-2xl bg-gray-200 flex items-center justify-center mb-6 text-gray-900">
                            <GraduationCap className="w-7 h-7" />
                        </div>
                        <h3 className="text-gray-900 text-xl font-bold mb-3">Learn from Top Peers</h3>
                        <p className="text-gray-700 font-medium leading-relaxed">Connect with high-achieving students who have already mastered the subjects you're learning.</p>
                    </div>
                    {/* Highlight 2 */}
                    <div className="bg-gray-100 rounded-3xl p-8 hover:-translate-y-1 transition-all duration-300 text-center flex flex-col items-center shadow-sm border border-gray-300">
                        <div className="w-14 h-14 rounded-2xl bg-gray-200 flex items-center justify-center mb-6 text-gray-900">
                            <Clock className="w-7 h-7" />
                        </div>
                        <h3 className="text-gray-900 text-xl font-bold mb-3">Flexible Scheduling</h3>
                        <p className="text-gray-700 font-medium leading-relaxed">Book sessions that fit seamlessly into your life. Learn at your own pace, anytime, anywhere.</p>
                    </div>
                    {/* Highlight 3 */}
                    <div className="bg-gray-100 rounded-3xl p-8 hover:-translate-y-1 transition-all duration-300 text-center flex flex-col items-center shadow-sm border border-gray-300">
                        <div className="w-14 h-14 rounded-2xl bg-gray-200 flex items-center justify-center mb-6 text-gray-900">
                            <Briefcase className="w-7 h-7" />
                        </div>
                        <h3 className="text-gray-900 text-xl font-bold mb-3">Teach & Earn</h3>
                        <p className="text-gray-700 font-medium leading-relaxed">Monetize your own skills by becoming a tutor. Help others while building your resume and income.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
