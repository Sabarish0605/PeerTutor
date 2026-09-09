import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading } = useContext(AuthContext);
    const location = useLocation();

    if (loading) {
        return <div className="text-center py-20">Loading...</div>;
    }

    if (!user) {
        // toast.error("Please login to access this page.");
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        if (user.role === 'STUDENT' && location.pathname.startsWith('/tutor/dashboard')) {
            toast('Please upgrade to a tutor first!', { icon: '🎓' });
            return <Navigate to="/tutor/onboarding" replace />;
        }
        toast.error("You do not have permission to access this page.");
        return <Navigate to="/" replace />;
    }

    return children;
}
