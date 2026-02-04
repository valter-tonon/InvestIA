import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // SEC-005: Send cookies automatically
});

// SEC-007: Add CSRF token to state-changing requests
api.interceptors.request.use((config) => {
    // Read CSRF token from cookie
    if (typeof document !== 'undefined') {
        const csrfToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('XSRF-TOKEN='))
            ?.split('=')[1];

        // Add token to header for state-changing methods
        if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
            config.headers['X-XSRF-TOKEN'] = csrfToken;
        }
    }

    return config;
});

// SEC-005: Simplified response interceptor - refresh handled by backend cookies
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        // If 401 and not already on login page, redirect to login
        // EXCEPTION: Don't redirect if it's the auth check (/auth/me)
        const isAuthCheck = error.config?.url?.includes('/auth/me');

        if (
            error.response?.status === 401 &&
            typeof window !== 'undefined' &&
            !window.location.pathname.includes('/login') &&
            !isAuthCheck
        ) {
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
