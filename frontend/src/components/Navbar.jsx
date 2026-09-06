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
        <nav className="bg-blue-600 text-white shadow-md relative z-50">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link to="/" className="font-extrabold text-2xl tracking-tight">PeerTutor</Link>

                <div className="flex items-center space-x-4">
                    {user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center space-x-2 focus:outline-none hover:bg-blue-700 p-1.5 rounded-full transition">
                                <div className="w-10 h-10 rounded-full bg-white text-blue-600 font-bold flex items-center justify-center shadow-sm border border-blue-100">
                                    {user.profileImage ? (
                                        <img src={user.profileImage} alt="Profile" className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        getInitials(user.name)
                                    )}
                                </div>
                                <span className="text-sm font-semibold hidden md:block pr-2">{user.name}</span>
                            </button>

                            {dropdownOpen && (
                                <div className="absolute right-0 mt-3 w-60 bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 overflow-hidden">
                                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                                        <p className="text-xs text-gray-500 font-medium">Signed in as</p>
                                        <p className="text-sm font-semibold text-gray-900 truncate">{user.email}</p>
                                    </div>

                                    <div className="py-1">
                                        <Link
                                            to="/student/dashboard"
                                            onClick={() => setDropdownOpen(false)}
                                            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                                            My Learning
                                        </Link>

                                        {/* Seamless Studio Route */}
                                        <Link
                                            to={user.role === 'TUTOR' ? "/tutor/dashboard" : "/tutor/setup"}
                                            onClick={() => setDropdownOpen(false)}
                                            className="block px-4 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition">
                                            Tutor Studio
                                        </Link>

                                        <Link
                                            to="/profile/settings"
                                            onClick={() => setDropdownOpen(false)}
                                            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                                            Profile Settings
                                        </Link>
                                    </div>

                                    <div className="py-1 border-t border-gray-100">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left block px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition font-medium">
                                            Log Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="hover:text-blue-100 font-medium transition">Login</Link>
                            <Link to="/register" className="bg-white text-blue-600 px-5 py-2 rounded-full font-bold hover:bg-blue-50 transition shadow-sm">
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}