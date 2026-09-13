import axios from 'axios';

export const BACKEND_URL = (import.meta.env.VITE_API_BASE_URL || 'https://hive-backend-gjvd.onrender.com/api').replace(/\/api\/?$/, '');

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://hive-backend-gjvd.onrender.com/api',
});

/**
 * Helper to resolve avatar image URLs.
 * If the path starts with /uploads/ or uploads/, or http://localhost:8080/uploads/,
 * prepend or replace with the production backend origin.
 */
export const getAvatarUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('/uploads/')) {
        return `${BACKEND_URL}${url}`;
    }
    if (url.startsWith('uploads/')) {
        return `${BACKEND_URL}/${url}`;
    }
    if (url.startsWith('http://localhost:8080/uploads/')) {
        return url.replace('http://localhost:8080', BACKEND_URL);
    }
    return url;
};

// Automatically attach the JWT token to every request if the user is logged in
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor: ONLY redirect on 401 Unauthorized token expirations.
// Do NOT redirect on 400, 403, 404, 500 or other errors so components can display specific error messages.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const requestUrl = error.config?.url || '';

        // If 401 and not an authentication attempt endpoint (login/register), clear storage and redirect
        if (status === 401 && !requestUrl.includes('/auth/login') && !requestUrl.includes('/auth/register')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Redirect to login only on genuine session expiration
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }

        // Return rejected promise for all errors so the calling component receives and handles the payload
        return Promise.reject(error);
    }
);

/**
 * Standardized error message extraction utility.
 * Extracts the most specific error message from the backend response or fallback.
 */
export const getErrorMessage = (error, fallback = 'An unexpected error occurred.') => {
    if (!error) return fallback;
    return (
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.details ||
        error.message ||
        fallback
    );
};

export default api;