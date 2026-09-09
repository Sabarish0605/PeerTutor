import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api', // Your Spring Boot URL
});

// Automatically attach the JWT token to every request if the user is logged in
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Automatically logout the user if the backend says their token is invalid
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Hard reload to clear context state and kick them to login
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;