'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, LoginInput, RegisterInput } from '../api/auth';

interface User {
    id: string;
    email: string;
    name: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (data: LoginInput) => Promise<void>;
    register: (data: RegisterInput) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    // SEC-005: Check auth via /auth/me endpoint (cookies sent automatically)
    const checkAuth = async () => {
        try {
            const userData = await authApi.me();
            setUser(userData);
        } catch {
            // No valid session - user not authenticated
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // SEC-005: Login - cookies set automatically by backend, also saving to localStorage for API clients
    const login = async (data: LoginInput) => {
        const response = await authApi.login(data);
        if (response.accessToken) {
            localStorage.setItem('token', response.accessToken);
        }
        setUser(response.user);
        router.push('/dashboard');
    };

    // SEC-005: Register - cookies set automatically by backend, also saving to localStorage for API clients
    const register = async (data: RegisterInput) => {
        const response = await authApi.register(data);
        if (response.accessToken) {
            localStorage.setItem('token', response.accessToken);
        }
        setUser(response.user);
        router.push('/dashboard');
    };

    // SEC-005: Logout - call backend to clear cookies
    const logout = async () => {
        try {
            await authApi.logout();
        } catch {
            // Ignore errors on logout
        } finally {
            localStorage.removeItem('token');
            setUser(null);
            router.push('/login');
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
