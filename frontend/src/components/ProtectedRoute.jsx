import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading } = useContext(AuthContext);
    const location = useLocation();

    // Still initializing — show spinner
    if (loading) {
        return <div className="text-center py-20">Loading...</div>;
    }

    // No user in context — but check localStorage as fallback to prevent
    // flash-redirect during React state settling after login
    const hasToken = !!localStorage.getItem('token');
    const storedUserStr = localStorage.getItem('user');

    if (!user && !hasToken) {
        return <Navigate to="/login" replace />;
    }

    // If token exists but user state hasn't settled yet, show brief loading
    if (!user && hasToken) {
        return <div className="text-center py-20">Loading...</div>;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        toast.error("You do not have permission to access this page.");
        return <Navigate to="/discover" replace />;
    }

    return children;
}
