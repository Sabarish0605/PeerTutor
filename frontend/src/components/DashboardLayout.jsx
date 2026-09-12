import { useContext, useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate, useSearchParams, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Home, BookOpen, Users, CircleUserRound, Search, X, Bell, Settings, LogOut, ExternalLink, Menu } from 'lucide-react';

export default function DashboardLayout() {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const urlQuery = searchParams.get('q') || '';
    const [searchTerm, setSearchTerm] = useState(urlQuery);

    useEffect(() => {
        setSearchTerm(urlQuery);
    }, [urlQuery]);

    const handleSearchChange = (val) => {
        setSearchTerm(val);
        const trimmed = val.trim();
        if (trimmed) {
            navigate(`/discover?q=${encodeURIComponent(trimmed)}`, { replace: true });
        } else {
            navigate('/discover', { replace: true });
        }
    };

    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        const trimmed = searchTerm.trim();
        if (trimmed) {
            navigate(`/discover?q=${encodeURIComponent(trimmed)}`, { replace: true });
        } else {
            navigate('/discover', { replace: true });
        }
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        navigate('/discover', { replace: true });
    };

    // YouTube-style collapsible sidebar state (persisted, default collapsed as requested)
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebar_collapsed');
        return saved !== null ? saved === 'true' : true;
    });

    const toggleSidebar = () => {
        setIsCollapsed(prev => {
            const next = !prev;
            localStorage.setItem('sidebar_collapsed', next.toString());
            return next;
        });
    };

    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const notificationsRef = useRef(null);

    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setNotificationsOpen(false);
            }
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setProfileMenuOpen(false);
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
        setProfileMenuOpen(false);
        logout();
        navigate('/');
    };

    const isActive = (path) => location.pathname.startsWith(path);

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    // Width: 72px for YouTube-style collapsed mini mode, 240px for expanded
    const sidebarWidth = isCollapsed ? 72 : 240;
    const iconColor = (path) => isActive(path) ? '#00C2CB' : '#aaaaaa';

    return (
        <div className="flex flex-col min-h-screen font-sans" style={{ background: '#0f0f0f', color: '#f1f1f1' }}>

            {/* ── Fixed Full-Width Topbar Header (YouTube Architecture: Logo and Hamburger stay fixed) ── */}
            <header
                className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4"
                style={{
                    height: 64,
                    background: 'rgba(15,15,15,0.98)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid #1f1f1f',
                }}
            >
                {/* Left Area: 3 lines hamburger button + FLUX Logo (Fixed position, NO line between them) */}
                <div className="flex items-center gap-4 flex-shrink-0">
                    <button
                        onClick={toggleSidebar}
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer text-[#f1f1f1] hover:bg-[#272727] focus:outline-none flex-shrink-0"
                        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        <Menu size={20} strokeWidth={2} />
                    </button>

                    <Link
                        to="/discover"
                        className="flex items-center gap-2.5 text-decoration-none flex-shrink-0"
                        style={{ textDecoration: 'none' }}
                    >
                        <img
                            src="/flux-icon.png"
                            alt="FLUX"
                            className="h-6 w-auto object-contain"
                        />
                        <span style={{
                            fontFamily: 'Roboto, Inter, sans-serif',
                            fontWeight: 800,
                            fontSize: 20,
                            color: '#ffffff',
                            letterSpacing: '-0.5px',
                            lineHeight: 1,
                        }}>
                            FLUX
                        </span>
                    </Link>
                </div>

                {/* Center: YouTube-style search bar */}
                <div style={{ flex: 1, maxWidth: 640, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <form onSubmit={handleSearchSubmit} style={{ width: '100%', maxWidth: 560, display: 'flex', alignItems: 'center' }}>
                        {/* Input field */}
                        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input
                                type="text"
                                placeholder="Search courses, tutors, topics..."
                                value={searchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="w-full text-sm focus:outline-none transition-all"
                                style={{
                                    background: '#121212',
                                    color: '#f1f1f1',
                                    border: '1px solid #3f3f3f',
                                    borderRight: 'none',
                                    borderRadius: '40px 0 0 40px',
                                    padding: '10px 38px 10px 16px',
                                    fontFamily: 'Roboto, Inter, sans-serif',
                                    fontSize: 14,
                                }}
                                onFocus={e => { e.target.style.borderColor = '#00C2CB'; e.target.style.background = '#0f0f0f'; }}
                                onBlur={e => { e.target.style.borderColor = '#3f3f3f'; e.target.style.background = '#121212'; }}
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    style={{
                                        position: 'absolute',
                                        right: 12,
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#888888',
                                        cursor: 'pointer',
                                        padding: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#f1f1f1'}
                                    onMouseLeave={e => e.currentTarget.style.color = '#888888'}
                                    title="Clear search"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                        {/* Search button */}
                        <button
                            type="submit"
                            style={{
                                height: 41,
                                padding: '0 20px',
                                background: '#272727',
                                border: '1px solid #3f3f3f',
                                borderLeft: 'none',
                                borderRadius: '0 40px 40px 0',
                                cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#aaaaaa',
                                flexShrink: 0,
                                transition: 'background 0.15s, color 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#3f3f3f'; e.currentTarget.style.color = '#f1f1f1'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#272727'; e.currentTarget.style.color = '#aaaaaa'; }}
                            title="Search"
                        >
                            <Search size={18} />
                        </button>
                    </form>
                </div>

                {/* Right side: Bell & Profile Picture Only */}
                <div className="flex items-center gap-4 ml-4 pr-5">
                    {/* Bell */}
                    <div className="relative" ref={notificationsRef}>
                        <button
                            onClick={() => {
                                if (!notificationsOpen && unreadCount > 0) markAllAsRead();
                                setNotificationsOpen(!notificationsOpen);
                            }}
                            className="relative p-2 rounded-full transition-colors cursor-pointer"
                            style={{ background: '#272727', border: '1px solid #3f3f3f', color: '#aaaaaa' }}
                            type="button"
                            title="Notifications"
                        >
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-red-500" style={{ boxShadow: '0 0 0 2px #212121' }} />
                            )}
                        </button>

                        {notificationsOpen && (
                            <div
                                className="absolute right-0 mt-3 w-80 rounded-2xl overflow-hidden z-50"
                                style={{ background: '#212121', border: '1px solid #3f3f3f', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
                            >
                                <div className="px-4 py-3 flex justify-between items-center" style={{ borderBottom: '1px solid #3f3f3f' }}>
                                    <p className="text-sm font-bold" style={{ color: '#f1f1f1' }}>Notifications</p>
                                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#00C2CB22', color: '#00C2CB' }}>{unreadCount} New</span>
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-6 text-center text-sm" style={{ color: '#aaaaaa' }}>No notifications yet.</div>
                                    ) : (
                                        notifications.map(notif => (
                                            <div
                                                key={notif.id}
                                                onClick={() => markAsRead(notif.id)}
                                                className="p-4 cursor-pointer transition-colors"
                                                style={{
                                                    borderBottom: '1px solid #3f3f3f',
                                                    background: notif.isRead ? 'transparent' : 'rgba(0,194,203,0.07)',
                                                    color: notif.isRead ? '#aaaaaa' : '#f1f1f1',
                                                }}
                                            >
                                                <p className={`text-sm ${notif.isRead ? '' : 'font-semibold'}`}>{notif.message}</p>
                                                <p className="text-xs mt-1" style={{ color: '#666' }}>{new Date(notif.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Profile Picture Only (Chrome-Style Popover on Click) */}
                    <div className="relative" ref={profileMenuRef}>
                        <button
                            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                            className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden transition-all focus:outline-none cursor-pointer"
                            style={{
                                border: '1.5px solid #3f3f3f',
                                background: '#272727',
                                boxShadow: profileMenuOpen ? '0 0 0 2px #00C2CB' : 'none',
                            }}
                            title="Account"
                        >
                            {user?.profileImage || user?.avatarUrl ? (
                                <img alt={user?.name || "Profile"} className="w-full h-full object-cover" src={user.profileImage || user.avatarUrl} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs font-bold" style={{ background: '#2e7d32', color: '#ffffff' }}>
                                    {getInitials(user?.name)}
                                </div>
                            )}
                        </button>

                        {/* Chrome-Style Profile Menu Dropdown */}
                        {profileMenuOpen && (
                            <div
                                className="absolute right-0 mt-3 w-80 rounded-[24px] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150"
                                style={{
                                    background: '#202124',
                                    border: '1px solid #3c4043',
                                    boxShadow: '0 12px 36px rgba(0,0,0,0.65)',
                                    padding: 12,
                                }}
                            >
                                {/* User Card */}
                                <div
                                    className="flex flex-col items-center text-center p-5 rounded-2xl mb-2"
                                    style={{ background: '#2d2f31' }}
                                >
                                    <div
                                        className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden mb-3"
                                        style={{
                                            background: '#2e7d32',
                                            color: '#ffffff',
                                            fontSize: 24,
                                            fontWeight: 700,
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                        }}
                                    >
                                        {user?.profileImage || user?.avatarUrl ? (
                                            <img alt={user.name} className="w-full h-full object-cover" src={user.profileImage || user.avatarUrl} />
                                        ) : (
                                            getInitials(user?.name)
                                        )}
                                    </div>
                                    <p className="text-base font-semibold text-[#f1f1f1] leading-tight">{user?.name || 'User'}</p>
                                    <p className="text-xs text-[#9aa0a6] mt-1">{user?.email || 'Student & Creator'}</p>

                                    <Link
                                        to={`/profile/${user?.id}`}
                                        onClick={() => setProfileMenuOpen(false)}
                                        className="mt-3 px-4 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                                        style={{
                                            background: '#8ab4f8',
                                            color: '#202124',
                                            textDecoration: 'none',
                                        }}
                                    >
                                        <span>View Profile</span>
                                        <ExternalLink size={12} />
                                    </Link>
                                </div>

                                {/* Action Links */}
                                <div className="flex flex-col gap-0.5 py-1">
                                    <Link
                                        to="/studio"
                                        onClick={() => setProfileMenuOpen(false)}
                                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors text-[#e8eaed] hover:bg-[#2d2f31]"
                                    >
                                        <CircleUserRound size={18} color="#8ab4f8" />
                                        <span>Your Studio</span>
                                    </Link>

                                    <Link
                                        to="/profile/settings"
                                        onClick={() => setProfileMenuOpen(false)}
                                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors text-[#e8eaed] hover:bg-[#2d2f31]"
                                    >
                                        <Settings size={18} color="#9aa0a6" />
                                        <span>Settings</span>
                                    </Link>

                                    <div style={{ height: 1, background: '#3c4043', margin: '6px 4px' }} />

                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors w-full text-left cursor-pointer"
                                        style={{ color: '#f28b82' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#3c2424'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <LogOut size={18} />
                                        <span>Sign out</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* ── YouTube Sidebar (Positioned strictly below the 64px header) ── */}
            <aside
                className="fixed left-0 bottom-0 z-40 flex flex-col justify-between"
                style={{
                    top: 64, // Below fixed header
                    width: sidebarWidth,
                    background: '#0f0f0f',
                    borderRight: '1px solid #272727',
                    transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflowX: 'hidden',
                    overflowY: 'auto',
                }}
            >
                {/* Navigation Items */}
                <nav className="flex flex-col gap-1 p-1.5 mt-2">
                    {isCollapsed ? (
                        /* ── Collapsed Mini Mode (Icon only, no text below) ── */
                        <>
                            <Link
                                to="/discover"
                                title="Home"
                                className={`flex items-center justify-center w-11 h-11 mx-auto rounded-xl transition-all ${
                                    isActive('/discover') ? 'bg-[#272727] text-white' : 'text-[#aaaaaa] hover:bg-[#272727] hover:text-white'
                                }`}
                            >
                                <Home size={20} color={iconColor('/discover')} strokeWidth={isActive('/discover') ? 2.2 : 1.8} />
                            </Link>

                            <Link
                                to="/my-learning"
                                title="My Learning"
                                className={`flex items-center justify-center w-11 h-11 mx-auto rounded-xl transition-all ${
                                    isActive('/my-learning') ? 'bg-[#272727] text-white' : 'text-[#aaaaaa] hover:bg-[#272727] hover:text-white'
                                }`}
                            >
                                <BookOpen size={20} color={iconColor('/my-learning')} strokeWidth={isActive('/my-learning') ? 2.2 : 1.8} />
                            </Link>

                            <Link
                                to="/subscriptions"
                                title="Subscriptions"
                                className={`flex items-center justify-center w-11 h-11 mx-auto rounded-xl transition-all ${
                                    isActive('/subscriptions') ? 'bg-[#272727] text-white' : 'text-[#aaaaaa] hover:bg-[#272727] hover:text-white'
                                }`}
                            >
                                <Users size={20} color={iconColor('/subscriptions')} strokeWidth={isActive('/subscriptions') ? 2.2 : 1.8} />
                            </Link>

                            <Link
                                to="/studio"
                                title="Studio"
                                className={`flex items-center justify-center w-11 h-11 mx-auto rounded-xl transition-all ${
                                    isActive('/studio') ? 'bg-[#272727] text-white' : 'text-[#aaaaaa] hover:bg-[#272727] hover:text-white'
                                }`}
                            >
                                <CircleUserRound size={20} color={iconColor('/studio')} strokeWidth={isActive('/studio') ? 2.2 : 1.8} />
                            </Link>
                        </>
                    ) : (
                        /* ── Expanded Full Mode (Horizontal icon + label) ── */
                        <>
                            <Link
                                to="/discover"
                                className={`flex items-center gap-4 px-3 py-2 rounded-xl text-[13px] font-medium transition-all whitespace-nowrap ${
                                    isActive('/discover') ? 'bg-[#272727] text-white' : 'text-[#aaaaaa] hover:bg-[#272727] hover:text-white'
                                }`}
                            >
                                <Home size={18} color={iconColor('/discover')} />
                                <span>Home</span>
                            </Link>

                            <Link
                                to="/my-learning"
                                className={`flex items-center gap-4 px-3 py-2 rounded-xl text-[13px] font-medium transition-all whitespace-nowrap ${
                                    isActive('/my-learning') ? 'bg-[#272727] text-white' : 'text-[#aaaaaa] hover:bg-[#272727] hover:text-white'
                                }`}
                            >
                                <BookOpen size={18} color={iconColor('/my-learning')} />
                                <span>My Learning</span>
                            </Link>

                            <Link
                                to="/subscriptions"
                                className={`flex items-center gap-4 px-3 py-2 rounded-xl text-[13px] font-medium transition-all whitespace-nowrap ${
                                    isActive('/subscriptions') ? 'bg-[#272727] text-white' : 'text-[#aaaaaa] hover:bg-[#272727] hover:text-white'
                                }`}
                            >
                                <Users size={18} color={iconColor('/subscriptions')} />
                                <span>Subscriptions</span>
                            </Link>

                            <div style={{ height: 1, background: '#272727', margin: '6px 4px' }} />

                            <Link
                                to="/studio"
                                className={`flex items-center gap-4 px-3 py-2 rounded-xl text-[13px] font-medium transition-all whitespace-nowrap ${
                                    isActive('/studio') ? 'bg-[#272727] text-white' : 'text-[#aaaaaa] hover:bg-[#272727] hover:text-white'
                                }`}
                            >
                                <CircleUserRound size={18} color={iconColor('/studio')} />
                                <span>Studio</span>
                            </Link>
                        </>
                    )}
                </nav>

                {/* Sidebar footer subtle branding (expanded mode only) */}
                {!isCollapsed && (
                    <div className="p-4" style={{ borderTop: '1px solid #1f1f1f' }}>
                        <p className="text-[11px] text-[#717171] text-center whitespace-nowrap">FLUX &copy; 2026</p>
                    </div>
                )}
            </aside>

            {/* ── Main Content Area (Dynamically shifts left with smooth transition) ── */}
            <div style={{
                paddingTop: 64,
                paddingLeft: sidebarWidth,
                width: '100%',
                transition: 'padding-left 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                minHeight: '100vh',
            }}>
                <Outlet />
            </div>
        </div>
    );
}
