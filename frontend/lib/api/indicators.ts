import { api } from './client';

export interface Indicators {
  cdi: number;
  ipca: number;
  selic: number;
}

export const indicatorsApi = {
  getIndicators: async (): Promise<Indicators> => {
    try {
      const response = await api.get<Indicators>('/indicators');
      return response.data;
    } catch {
      // Fallback values if API is unavailable
      return {
        cdi: 10.0,
        ipca: 4.5,
        selic: 10.5,
      };
    }
  },
};
