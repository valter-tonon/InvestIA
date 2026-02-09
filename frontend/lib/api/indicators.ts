import { api } from './client';

export interface EconomicIndicators {
    SELIC: number;
    CDI: number;
    IPCA: number;
}

const CACHE_KEY = 'investcopilot_indicators';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const indicatorsApi = {
    getIndicators: async (): Promise<EconomicIndicators> => {
        // Try to get from cache first
        if (typeof window !== 'undefined') {
            try {
                const cached = localStorage.getItem(CACHE_KEY);
                if (cached) {
                    const { data, timestamp } = JSON.parse(cached);
                    const age = Date.now() - timestamp;

                    if (age < CACHE_DURATION) {
                        return data as EconomicIndicators;
                    }
                }
            } catch (e) {
                // Ignore cache errors
                console.warn('Failed to parse cached indicators', e);
            }
        }

        // Fetch fresh data
        const response = await api.get('/indicators');

        // Update cache
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    data: response.data,
                    timestamp: Date.now()
                }));
            } catch (e) {
                console.warn('Failed to save indicators to cache', e);
            }
        }

        return response.data;
    },
};
