import { api } from './client';

export interface LoginInput {
    email: string;
    password: string;
}

export interface RegisterInput {
    name: string;
    email: string;
    password: string;
}

// SEC-005: Updated response - tokens returned for backward compatibility
export interface AuthResponse {
    user: {
        id: string;
        email: string;
        name: string;
    };
    accessToken: string;
    refreshToken: string;
}

export const authApi = {
    login: async (data: LoginInput): Promise<AuthResponse> => {
        const response = await api.post('/auth/login', data);
        return response.data;
    },

    register: async (data: RegisterInput): Promise<AuthResponse> => {
        const response = await api.post('/auth/register', data);
        return response.data;
    },

    me: async () => {
        const response = await api.get('/auth/me');
        return response.data.data;
    },

    // SEC-005: Logout endpoint to clear cookies
    logout: async (): Promise<void> => {
        await api.post('/auth/logout');
    },
};
