import { api } from './client';

export interface EconomicIndicators {
    SELIC: number;
    CDI: number;
    IPCA: number;
}

export const indicatorsApi = {
    getIndicators: async (): Promise<EconomicIndicators> => {
        const response = await api.get('/indicators');
        return response.data;
    },
};
