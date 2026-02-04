import { api } from './client';
import { Dividend } from '@/types/dividend';

export const dividendsApi = {
    /**
     * Busca histórico de dividendos de um ativo
     */
    async getDividendHistory(ticker: string, years?: number): Promise<Dividend[]> {
        const params = years ? `?years=${years}` : '';
        const response = await api.get(`/assets/${ticker}/dividends${params}`);
        return response.data;
    },

    /**
     * Sincroniza dividendos com a API Brapi
     */
    async syncDividends(ticker: string): Promise<Dividend[]> {
        const response = await api.post(`/assets/${ticker}/dividends/sync`);
        return response.data;
    },
};
