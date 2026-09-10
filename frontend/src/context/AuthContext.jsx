import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = async () => {
        try {
            const res = await api.get('/users/me');
            if (res.data) {
                const refreshed = {
                    ...res.data,
                    id: res.data.id || res.data.userId,
                    profileImage: res.data.profileImage || res.data.avatarUrl,
                    avatarUrl: res.data.profileImage || res.data.avatarUrl
                };
                localStorage.setItem('user', JSON.stringify(refreshed));
                setUser(refreshed);
                return refreshed;
            }
        } catch (err) {
            console.warn("Could not refresh user profile:", err?.message);
        }
        return null;
    };

    useEffect(() => {
        // Check if token and user data exist in localStorage on load
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (storedUser && token) {
            try {
                const parsed = JSON.parse(storedUser);
                setUser(parsed);
            } catch {
                localStorage.removeItem('user');
            }
            // Background sync with database to fetch profileImage, bio, etc.
            refreshUser();
        }
        setLoading(false);
    }, []);

    const login = (userData, token) => {
        const profileImg = userData.profileImage || userData.avatarUrl || null;
        const normalizedUser = {
            ...userData,
            id: userData.id || userData.userId,
            profileImage: profileImg,
            avatarUrl: profileImg
        };

        if (token) {
            localStorage.setItem('token', token);
        }
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        setUser(normalizedUser);

        // Defer profile sync so navigation happens first
        setTimeout(() => { refreshUser(); }, 500);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, refreshUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}