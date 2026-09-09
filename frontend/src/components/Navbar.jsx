import { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        setDropdownOpen(false);
        navigate('/');
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    return (
        <nav className="backdrop-blur-md bg-[#0B0F19]/80 border-b border-white/5 text-white shadow-md relative z-50">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link to="/" className="font-extrabold text-2xl tracking-tight text-white">PeerTutor</Link>

                <div className="flex items-center space-x-4">
                    {user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center space-x-2 focus:outline-none hover:bg-primary-700 p-1.5 rounded-full transition">
                                <div className="w-10 h-10 rounded-full bg-[#F8F9FA] text-primary-600 font-bold flex items-center justify-center shadow-sm border border-primary-100">
                                    {user.profileImage ? (
                                        <img src={user.profileImage} alt="Profile" className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        getInitials(user.name)
                                    )}
                                </div>
                                <span className="text-sm font-semibold hidden md:block pr-2">{user.name}</span>
                            </button>

                            {dropdownOpen && (
                                <div className="absolute right-0 mt-3 w-60 bg-[#121826]/90 backdrop-blur-md rounded-lg shadow-xl border border-white/10 overflow-hidden z-50">
                                    <div className="px-4 py-3 bg-white/5 border-b border-white/10">
                                        <p className="text-xs text-gray-400 font-medium">Signed in as</p>
                                        <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                                    </div>

                                    <div className="py-1">
                                        {/* NEW: Link back to the Marketplace */}
                                        <Link
                                            to="/discover"
                                            onClick={() => setDropdownOpen(false)}
                                            className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition">
                                            Discover Courses
                                        </Link>

                                        {/* FIXED: My Learning now points to the correct route */}
                                        <Link
                                            to="/my-learning"
                                            onClick={() => setDropdownOpen(false)}
                                            className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition">
                                            My Learning
                                        </Link>

                                        {/* Seamless Studio Route */}
                                        {user.role === 'STUDENT' ? (
                                            <Link
                                                to="/tutor/onboarding"
                                                onClick={() => setDropdownOpen(false)}
                                                className="block px-4 py-2.5 text-sm font-semibold text-primary-400 hover:bg-white/10 transition">
                                                Become a Tutor
                                            </Link>
                                        ) : (
                                            <Link
                                                to="/tutor/dashboard"
                                                onClick={() => setDropdownOpen(false)}
                                                className="block px-4 py-2.5 text-sm font-semibold text-primary-400 hover:bg-white/10 transition">
                                                Tutor Studio
                                            </Link>
                                        )}

                                        <Link
                                            to="/profile/settings"
                                            onClick={() => setDropdownOpen(false)}
                                            className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition">
                                            Profile Settings
                                        </Link>
                                    </div>

                                    <div className="py-1 border-t border-white/10">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left block px-4 py-2.5 text-sm text-red-400 hover:bg-white/10 hover:text-red-300 transition font-medium">
                                            Log Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
            </div>
        </nav>
    );
}