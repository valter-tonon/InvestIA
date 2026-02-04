export interface FairPriceCalculation {
    method: 'bazin' | 'barsi' | 'graham';
    price: number;
    description: string;
}

export interface FairPriceResult {
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
