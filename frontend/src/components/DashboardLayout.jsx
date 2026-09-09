import { useContext, useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Compass, BookOpen, Users, Presentation, LogOut, Search, Bell } from 'lucide-react';

export default function DashboardLayout() {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const notificationsRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setNotificationsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (user?.id) {
            fetchNotifications();
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const res = await api.get(`/notifications/user/${user.id}`);
            setNotifications(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put(`/notifications/mark-read`);
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error("Failed to mark all notifications as read", error);
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path) => location.pathname.startsWith(path);

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    return (
        <div className="flex min-h-screen font-sans bg-gray-200 bg-[radial-gradient(#6b7280_1.5px,transparent_1.5px)] bg-[size:24px_24px] text-gray-900">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-sidebar-expanded bg-white border-r border-gray-200 z-50 flex flex-col justify-between shadow-sm">
                <div className="flex flex-col">
                    <div className="h-topbar-height px-gutter-lg flex items-center gap-3 border-b border-gray-200">
                        <img alt="PeerTutor Logo" className="h-8 w-8 object-contain rounded-lg shadow-sm" src="https://lh3.googleusercontent.com/aida/AEtjO1Wlmo9wD7fcbBz3IM6rcnGsD-QXNF90n8ZeYchl1tmxGLggXtJ_q_60_098lw7Ltq1h8EzYjBiuzadx6UTp8ztaxcY2NmjgCZASS9N-yhO6NYeuQA3vaJO0ezmiTPbwCaxKUIQy3eUjL6HxvX6BxF9ItPJlsh6gt-QOW_2kfkbsPhNliPraOp-jnV9bGtYA3LX-uPbyBy4X8OI9BnfTx1oQUtz5EOL-i6gDVoSQje73GEPtrOU_OqdX2g" />
                        <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-gray-900 tracking-tight text-lg">PeerTutor</span>
                        </div>
                    </div>
                    <nav className="flex flex-col gap-1.5 p-3">
                        <Link to="/discover" className={`flex items-center gap-3 px-3.5 py-2.5 transition-all font-medium text-sm rounded-xl ${isActive('/discover') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                            <Compass size={20} className={isActive('/discover') ? 'text-blue-600' : 'text-gray-500'} />
                            <span>Discover</span>
                        </Link>
                        <Link to="/my-learning" className={`flex items-center gap-3 px-3.5 py-2.5 transition-all font-medium text-sm rounded-xl ${isActive('/my-learning') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                            <BookOpen size={20} className={isActive('/my-learning') ? 'text-blue-600' : 'text-gray-500'} />
                            <span>My Learning</span>
                        </Link>
                        <Link to="/subscriptions" className={`flex items-center gap-3 px-3.5 py-2.5 transition-all font-medium text-sm rounded-xl ${isActive('/subscriptions') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                            <Users size={20} className={isActive('/subscriptions') ? 'text-blue-600' : 'text-gray-500'} />
                            <span>Subscriptions</span>
                        </Link>

                        {user?.role === 'STUDENT' ? (
                            <Link to="/tutor/onboarding" className={`flex items-center gap-3 px-3.5 py-2.5 transition-all font-medium text-sm rounded-xl mt-2 ${isActive('/tutor/onboarding') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                                <Presentation size={20} className={isActive('/tutor/onboarding') ? 'text-blue-600' : 'text-gray-500'} />
                                <span>Become a Tutor</span>
                            </Link>
                        ) : (
                            <Link to="/tutor/dashboard" className={`flex items-center gap-3 px-3.5 py-2.5 transition-all font-medium text-sm rounded-xl mt-2 ${isActive('/tutor/dashboard') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                                <Presentation size={20} className={isActive('/tutor/dashboard') ? 'text-blue-600' : 'text-gray-500'} />
                                <span>Tutor Studio</span>
                            </Link>
                        )}
                    </nav>
                </div>
                <div className="p-3 border-t border-gray-200">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-all font-medium text-sm text-left">
                        <LogOut size={20} />
                        <span>Log Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="pl-sidebar-expanded w-full">
                {/* Topbar */}
                <header className="fixed top-0 left-sidebar-expanded right-0 h-topbar-height z-40 px-margin-page flex items-center justify-between pointer-events-none bg-white/80 backdrop-blur-md border-b border-gray-200">
                    <div className="pointer-events-auto w-full max-w-lg">
                        <div className="relative flex items-center text-gray-400 focus-within:text-blue-500 transition-colors">
                            <Search size={20} className="absolute left-4 pointer-events-none" />
                            <input 
                                className="w-full bg-white text-gray-900 placeholder:text-gray-500 text-sm font-sans rounded-full border border-gray-300 pl-11 pr-12 py-2 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                                placeholder="Search courses, topics, or peer tutors..." 
                                type="text"
                            />
                            <span className="absolute right-3.5 px-2 py-0.5 rounded bg-gray-100 text-gray-500 font-mono text-[11px] border border-gray-200">⌘K</span>
                        </div>
                    </div>
                    
                    <div className="pointer-events-auto flex items-center gap-4">
                        <div className="relative" ref={notificationsRef}>
                            <button 
                                onClick={() => {
                                    if (!notificationsOpen && unreadCount > 0) {
                                        markAllAsRead();
                                    }
                                    setNotificationsOpen(!notificationsOpen);
                                }}
                                className="relative p-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 shadow-sm transition-colors" 
                                type="button"
                            >
                                <Bell size={22} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                                )}
                            </button>

                            {notificationsOpen && (
                                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50">
                                    <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                                        <p className="text-sm font-bold text-gray-900">Notifications</p>
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{unreadCount} New</span>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-6 text-center text-sm text-gray-500">No notifications yet.</div>
                                        ) : (
                                            notifications.map(notif => (
                                                <div 
                                                    key={notif.id} 
                                                    onClick={() => markAsRead(notif.id)}
                                                    className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${notif.isRead ? 'bg-white hover:bg-gray-50' : 'bg-blue-50/50 hover:bg-blue-50'}`}
                                                >
                                                    <p className={`text-sm ${notif.isRead ? 'text-gray-600' : 'text-gray-900 font-semibold'}`}>{notif.message}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{new Date(notif.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <Link to={`/profile/${user?.id}`} className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors cursor-pointer">
                            {user?.profileImage ? (
                                <img alt="Profile" className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-200" src={user.profileImage} />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm ring-1 ring-blue-200">
                                    {getInitials(user?.name)}
                                </div>
                            )}
                            <div className="flex flex-col leading-tight">
                                <span className="text-xs font-semibold text-gray-900 font-sans">{user?.name}</span>
                                <span className="text-[11px] text-gray-500">{(user?.role === 'TUTOR') ? 'Student & Tutor' : 'Student'}</span>
                            </div>
                        </Link>
                    </div>
                </header>

                <main className="w-full pt-topbar-height min-h-screen px-margin-page pb-margin-page">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
