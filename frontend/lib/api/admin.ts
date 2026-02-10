import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const adminApi = axios.create({
    baseURL: `${API_URL}/admin`,
    withCredentials: true,
});

// Add token from localStorage to requests
adminApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Dashboard
export interface DashboardStats {
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    newUsersThisWeek: number;
    newUsersThisMonth: number;
    subscriptionsByPlan: {
        FREE: number;
        PRO: number;
        PREMIUM: number;
    };
    subscriptionsByStatus: {
        ACTIVE: number;
        CANCELED: number;
        EXPIRED: number;
        TRIAL: number;
    };
    recentActivity: Array<{
        id: string;
        action: string;
        userId: string | null;
        details: unknown;
        createdAt: string;
    }>;
}

export const getDashboard = async (): Promise<DashboardStats> => {
    const { data } = await adminApi.get('/dashboard');
    return data;
};

// Users
export interface AdminUser {
    id: string;
    email: string;
    name: string | null;
    role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
    createdAt: string;
    updatedAt: string;
    deleted_at: string | null;
    subscription?: {
        id: string;
        plan: {
            id: string;
            name: string;
            displayName: string;
            price: number;
            interval: 'MONTHLY' | 'YEARLY' | 'LIFETIME';
        };
        status: 'ACTIVE' | 'CANCELED' | 'EXPIRED' | 'TRIAL';
        startDate: string;
        endDate: string | null;
    };
}

export interface ListUsersParams {
    page?: number;
    perPage?: number;
    search?: string;
    role?: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
    sort?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        perPage: number;
        lastPage: number;
    };
}

export const listUsers = async (params: ListUsersParams): Promise<PaginatedResponse<AdminUser>> => {
    const { data } = await adminApi.get('/users', { params });
    return data;
};

export const updateUserRole = async (userId: string, role: 'USER' | 'ADMIN' | 'SUPER_ADMIN') => {
    const { data } = await adminApi.patch(`/users/${userId}/role`, { role });
    return data;
};

export const suspendUser = async (userId: string) => {
    const { data } = await adminApi.patch(`/users/${userId}/suspend`);
    return data;
};

export const reactivateUser = async (userId: string) => {
    const { data } = await adminApi.patch(`/users/${userId}/reactivate`);
    return data;
};

export const deleteUser = async (userId: string) => {
    await adminApi.delete(`/users/${userId}`);
};

// Subscriptions
export interface Subscription {
    id: string;
    userId: string;
    plan: {
        id: string;
        name: string;
        displayName: string;
        price: number;
        interval: 'MONTHLY' | 'YEARLY' | 'LIFETIME';
    };
    status: 'ACTIVE' | 'CANCELED' | 'EXPIRED' | 'TRIAL';
    startDate: string;
    endDate: string | null;
    createdAt: string;
    updatedAt: string;
    user: {
        id: string;
        email: string;
        name: string | null;
        role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
    };
}

export interface ListSubscriptionsParams {
    page?: number;
    perPage?: number;
    planId?: string;
    status?: 'ACTIVE' | 'CANCELED' | 'EXPIRED' | 'TRIAL';
}

export const listSubscriptions = async (params: ListSubscriptionsParams): Promise<PaginatedResponse<Subscription>> => {
    const { data } = await adminApi.get('/subscriptions', { params });
    return data;
};

export const updateSubscription = async (
    subscriptionId: string,
    updates: {
        planId?: string;
        status?: 'ACTIVE' | 'CANCELED' | 'EXPIRED' | 'TRIAL';
        endDate?: string;
    }
) => {
    const { data } = await adminApi.patch(`/subscriptions/${subscriptionId}`, updates);
    return data;
};

// Activity Logs
export interface ActivityLog {
    id: string;
    userId: string | null;
    action: string;
    details: unknown;
    ipAddress: string | null;
    createdAt: string;
}

export const listActivityLogs = async (page = 1, perPage = 50): Promise<PaginatedResponse<ActivityLog>> => {
    const { data } = await adminApi.get('/activity-logs', { params: { page, perPage } });
    return data;
};
