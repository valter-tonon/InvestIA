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

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    user: {
        id: string;
        email: string;
        name: string;
    };
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
};
