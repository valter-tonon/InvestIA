import { api } from './client';
import type { RankedAsset, RankingStrategy } from '@/lib/types/ranking';

export const rankingApi = {
    getRanking: async (strategy: RankingStrategy = 'COMPOSITE' as RankingStrategy, limit: number = 50): Promise<RankedAsset[]> => {
        const response = await api.get(`/ranking?strategy=${strategy}&limit=${limit}`);
        return response.data;
    },
};
