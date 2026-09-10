import { useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Search, ChevronDown, MonitorPlay, Code, PenTool, Layout, Database, Terminal, CheckCircle2, Award, PlayCircle } from 'lucide-react';

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
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Navbar />

            {/* Hero Section */}
            <main className="flex-grow flex flex-col items-center">
                <div className="w-full max-w-7xl mx-auto px-6 py-16 md:py-24 flex flex-col md:flex-row items-center gap-12">
                    {/* Left side: Content */}
                    <div className="w-full md:w-1/2 flex flex-col items-start text-left">
                        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-[1.1] mb-6 tracking-tight">
                            Upgrade Your Skills <br />
                            <span className="text-primary">With PeerTutor</span>
                        </h1>
                        <p className="text-slate-600 text-lg mb-8 max-w-lg leading-relaxed">
                            Join a thriving community of students teaching students. Find expert tutors, learn at your own pace, and master any subject today.
                        </p>

                        {/* Search Bar */}
                        <div className="w-full max-w-xl bg-white p-2 rounded-full shadow-sm border border-slate-200 flex items-center gap-2">
                            <div className="hidden sm:flex items-center gap-2 px-4 py-2 border-r border-slate-200 text-slate-600 font-medium cursor-pointer hover:bg-slate-50 rounded-l-full">
                                <span>Category</span>
                                <ChevronDown size={16} />
                            </div>
                            <div className="flex-grow flex items-center px-4">
                                <Search size={20} className="text-slate-400 mr-2" />
                                <input 
                                    type="text" 
                                    placeholder="Search for courses..." 
                                    className="w-full bg-transparent outline-none text-slate-800 placeholder-slate-400"
                                />
                            </div>
                            <button className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-full font-semibold transition-colors whitespace-nowrap">
                                Find Course
                            </button>
                        </div>
                    </div>

                    {/* Right side: Masonry Grid */}
                    <div className="w-full md:w-1/2 flex justify-center md:justify-end">
                        <div className="relative w-full max-w-md h-[500px]">
                            {/* Top Left */}
                            <div className="absolute top-0 left-0 w-48 h-64 bg-indigo-100 rounded-3xl shadow-sm border border-white/50 flex items-center justify-center overflow-hidden z-10">
                                <img src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=600&auto=format&fit=crop" alt="Student" className="w-full h-full object-cover" />
                            </div>
                            {/* Top Right */}
                            <div className="absolute top-12 right-0 w-40 h-40 bg-teal-100 rounded-full shadow-sm border border-white/50 flex items-center justify-center overflow-hidden z-20">
                                <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&auto=format&fit=crop" alt="Student" className="w-full h-full object-cover" />
                            </div>
                            {/* Bottom Center */}
                            <div className="absolute bottom-4 left-16 w-56 h-48 bg-coral-100 rounded-[40px] shadow-sm border border-white/50 flex items-center justify-center overflow-hidden z-30">
                                <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600&auto=format&fit=crop" alt="Students studying" className="w-full h-full object-cover" />
                            </div>
                            {/* Small accent dot */}
                            <div className="absolute bottom-24 right-8 w-12 h-12 bg-secondary rounded-full shadow-md z-0"></div>
                            <div className="absolute top-32 -left-6 w-8 h-8 bg-primary rounded-full shadow-md z-0"></div>
                        </div>
                    </div>
                </div>

                {/* Categories Section */}
                <div className="w-full bg-white py-20 border-y border-slate-100">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Explore Most Popular Course Categories</h2>
                            <p className="text-slate-500">Discover top categories chosen by our community of learners.</p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-6">
                            {[
                                { name: "Computer Science", icon: MonitorPlay, color: "bg-blue-100 text-blue-600" },
                                { name: "Web Development", icon: Code, color: "bg-orange-100 text-orange-600" },
                                { name: "Design & UX", icon: PenTool, color: "bg-pink-100 text-pink-600" },
                                { name: "Data Science", icon: Database, color: "bg-emerald-100 text-emerald-600" },
                                { name: "Software Eng", icon: Terminal, color: "bg-purple-100 text-purple-600" },
                            ].map((category, idx) => (
                                <Link to="/login" key={idx} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col items-center gap-4 w-40 cursor-pointer">
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${category.color}`}>
                                        <category.icon size={24} />
                                    </div>
                                    <span className="font-semibold text-slate-800 text-sm text-center">{category.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="w-full max-w-7xl mx-auto px-6 py-24 flex flex-col md:flex-row items-center gap-16">
                    {/* Left side: Large Image */}
                    <div className="w-full md:w-1/2">
                        <div className="relative w-full aspect-square md:aspect-[4/5] bg-blue-50 rounded-[40px] overflow-hidden border border-slate-100 shadow-sm p-4">
                            <img 
                                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop" 
                                alt="Learning experience" 
                                className="w-full h-full object-cover rounded-[32px]"
                            />
                        </div>
                    </div>

                    {/* Right side: Features List */}
                    <div className="w-full md:w-1/2 flex flex-col">
                        <h2 className="text-4xl font-bold text-slate-900 mb-6 tracking-tight">Transform Your Learning Experience</h2>
                        <p className="text-slate-600 mb-10 text-lg">
                            We provide all the tools you need to succeed. Learn at your own pace with high-quality content from top peer tutors.
                        </p>

                        <div className="space-y-8">
                            <div className="flex gap-4 items-start">
                                <div className="mt-1 w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0 text-secondary">
                                    <Award size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">Course Complete Certificate</h3>
                                    <p className="text-slate-600 leading-relaxed">Earn verifiable certificates upon completion to showcase your new skills to employers and institutions.</p>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start">
                                <div className="mt-1 w-12 h-12 rounded-xl bg-coral-50 flex items-center justify-center flex-shrink-0 text-primary">
                                    <PlayCircle size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">Quizzes, Videos & More</h3>
                                    <p className="text-slate-600 leading-relaxed">Engage with interactive content, test your knowledge with quizzes, and watch high-quality video lectures.</p>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start">
                                <div className="mt-1 w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 text-indigo-500">
                                    <CheckCircle2 size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">Expert Peer Reviews</h3>
                                    <p className="text-slate-600 leading-relaxed">Get personalized feedback and guidance from tutors who have recently mastered the exact same material.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
