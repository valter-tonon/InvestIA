import { api } from './client';

export interface FairPriceCalculation {
    method: string;
    price: number;
    description: string;
}

export interface FairPriceResponse {
    assetId: string;
    ticker: string;
    currentPrice: number | null;
    calculations: {
        bazin: FairPriceCalculation;
        barsi: FairPriceCalculation;
        graham: FairPriceCalculation;
    };
    recommendation: 'COMPRA' | 'VENDA' | 'NEUTRO';
    lowestPrice: number;
    highestPrice: number;
    yieldOnCost: number | null;
    averagePurchasePrice: number | null;
}

export const fairPriceApi = {
    async getFairPrice(assetId: string): Promise<FairPriceResponse> {
        const response = await api.get(`/assets/${assetId}/fair-price`);
        return response.data;
    },
};
