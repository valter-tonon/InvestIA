import { api } from './client';

export interface Asset {
    id: string;
    ticker: string;
    name: string;
    type: string;
    sector?: string;
    indicators?: {
        pl?: number;
        pvp?: number;
        dy?: number;
        roe?: number;
    };
    currentPrice?: number;
    updatedAt: string;
}

export const assetsApi = {
    list: async (filters?: { type?: string; sector?: string }) => {
        const response = await api.get('/assets', { params: filters });
        return response.data.data;
    },

    create: async (data: Partial<Asset>) => {
        const response = await api.post('/assets', data);
        return response.data.data;
    },

    getByTicker: async (ticker: string) => {
        const response = await api.get(`/assets/ticker/${ticker}`);
        return response.data.data;
    },
};
