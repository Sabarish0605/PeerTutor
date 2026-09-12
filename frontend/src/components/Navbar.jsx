import { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import FluxLogo from './FluxLogo';

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
        <nav className="sticky top-0 bg-white border-b border-slate-200 text-slate-800 shadow-sm relative z-50">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <FluxLogo size={26} fontSize={16} color="#1e293b" />
                </Link>

                <div className="flex items-center space-x-4">
                    {user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center space-x-2 focus:outline-none hover:bg-slate-100 p-1.5 rounded-full transition">
                                <div className="w-10 h-10 rounded-full bg-slate-100 text-primary font-bold flex items-center justify-center shadow-sm border border-slate-200">
                                    {user.profileImage ? (
                                        <img src={user.profileImage} alt="Profile" className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        getInitials(user.name)
                                    )}
                                </div>
                                <span className="text-sm font-semibold hidden md:block pr-2 text-slate-800">{user.name}</span>
                            </button>

                            {dropdownOpen && (
                                <div className="absolute right-0 mt-3 w-60 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden z-50">
                                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                                        <p className="text-xs text-slate-500 font-medium">Signed in as</p>
                                        <p className="text-sm font-semibold text-slate-900 truncate">{user.email}</p>
                                    </div>

                                    <div className="py-1">
                                        <Link
                                            to="/discover"
                                            onClick={() => setDropdownOpen(false)}
                                            className="block px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-secondary transition">
                                            Discover Courses
                                        </Link>

                                        <Link
                                            to="/my-learning"
                                            onClick={() => setDropdownOpen(false)}
                                            className="block px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-secondary transition">
                                            My Learning
                                        </Link>

                                        {user.role === 'STUDENT' ? (
                                            <Link
                                                to="/tutor/onboarding"
                                                onClick={() => setDropdownOpen(false)}
                                                className="block px-4 py-2.5 text-sm font-semibold text-primary hover:bg-slate-50 transition">
                                                Become a Tutor
                                            </Link>
                                        ) : (
                                            <Link
                                                to="/tutor/dashboard"
                                                onClick={() => setDropdownOpen(false)}
                                                className="block px-4 py-2.5 text-sm font-semibold text-primary hover:bg-slate-50 transition">
                                                Tutor Studio
                                            </Link>
                                        )}

                                        <Link
                                            to="/profile/settings"
                                            onClick={() => setDropdownOpen(false)}
                                            className="block px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-secondary transition">
                                            Profile Settings
                                        </Link>
                                    </div>

                                    <div className="py-1 border-t border-slate-200">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left block px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition font-medium">
                                            Log Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link to="/login" className="text-slate-600 hover:text-secondary font-medium transition flex items-center gap-1.5 text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                                Log in
                            </Link>
                            <Link to="/register" className="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-full font-medium transition text-sm shadow-sm">
                                Sign up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}