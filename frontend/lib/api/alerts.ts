import { api } from './client';
import { CreateAlertDto, PriceAlert, UpdateAlertDto } from '../types/alerts';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const alertsApi = {
    create: async (data: CreateAlertDto): Promise<PriceAlert> => {
        const response = await api.post('/alerts', data);
        return response.data;
    },

    findAll: async (): Promise<PriceAlert[]> => {
        // Use custom endpoint logic if needed, or simple get
        const response = await api.get('/alerts');
        return response.data;
    },

    update: async (id: string, data: UpdateAlertDto): Promise<PriceAlert> => {
        const response = await api.patch(`/alerts/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/alerts/${id}`);
    },

    toggle: async (id: string): Promise<PriceAlert> => {
        const response = await api.patch(`/alerts/${id}/toggle`);
        return response.data;
    }
};
