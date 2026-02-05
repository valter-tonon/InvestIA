import { api } from './client';
import type { DashboardSummary, PerformanceDataPoint, SectorDistribution, TopAsset } from '../types/dashboard';
import { PriceAlert } from '../types/alerts';

// SEC-005: Use axios client with automatic cookie handling
export const dashboardApi = {
    getSummary: async (): Promise<DashboardSummary> => {
        const response = await api.get('/dashboard/summary');
        return response.data;
    },

    getPerformance: async (period: '7d' | '30d' | '90d' | '1y' | 'all' = '30d'): Promise<PerformanceDataPoint[]> => {
        const response = await api.get(`/dashboard/performance?period=${period}`);
        return response.data.data;
    },

    getSectors: async (): Promise<SectorDistribution[]> => {
        const response = await api.get('/dashboard/sectors');
        return response.data.data;
    },

    getTopAssets: async (limit: number = 5): Promise<TopAsset[]> => {
        const response = await api.get(`/dashboard/top-assets?limit=${limit}`);
        return response.data.data;
    },

    getRecentAlerts: async (limit: number = 5): Promise<PriceAlert[]> => {
        const response = await api.get(`/dashboard/alerts?limit=${limit}`);
        return response.data.data;
    },
};
