import { api } from './client';
import type { Asset, CreateAssetInput, UpdateAssetInput, AssetFilters, PaginatedResult } from '@/lib/types/asset';


export const assetsApi = {
    // Listar ativos com filtros
    // Listar ativos com filtros
    list: async (filters?: AssetFilters): Promise<PaginatedResult<Asset>> => {
        const params = new URLSearchParams();
        if (filters?.type) params.append('type', filters.type);
        if (filters?.sector) params.append('sector', filters.sector);
        if (filters?.search) params.append('search', filters.search);
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.perPage) params.append('perPage', filters.perPage.toString());

        const queryString = params.toString();
        const url = queryString ? `/assets?${queryString}` : '/assets';
        const response = await api.get(url);
        // Backend returns { data: [...], meta: {...} } directly now
        return response.data;
    },

    // Buscar por ID
    getById: async (id: string): Promise<Asset> => {
        const response = await api.get(`/assets/${id}`);
        return response.data.data || response.data;
    },

    // Buscar por ticker
    getByTicker: async (ticker: string): Promise<Asset> => {
        const response = await api.get(`/assets/ticker/${ticker}`);
        return response.data.data || response.data;
    },

    // Criar ativo
    create: async (data: CreateAssetInput): Promise<Asset> => {
        const response = await api.post('/assets', data);
        return response.data.data || response.data;
    },

    // Atualizar ativo
    update: async (id: string, data: UpdateAssetInput): Promise<Asset> => {
        const response = await api.put(`/assets/${id}`, data);
        return response.data.data || response.data;
    },

    // Atualizar indicadores
    updateIndicators: async (id: string, indicators: Partial<Asset>): Promise<Asset> => {
        const response = await api.patch(`/assets/${id}/indicators`, indicators);
        return response.data.data || response.data;
    },

    // Remover ativo
    delete: async (id: string): Promise<void> => {
        await api.delete(`/assets/${id}`);
    },
};
