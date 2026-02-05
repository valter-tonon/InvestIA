export enum AlertCondition {
    ABOVE = 'ABOVE',
    BELOW = 'BELOW',
    EQUAL = 'EQUAL',
}

export interface PriceAlert {
    id: string;
    userId: string;
    assetId: string;
    targetPrice: number;
    condition: AlertCondition;
    isActive: boolean;
    triggeredAt?: string; // ISO date string from JSON
    createdAt: string;
    updatedAt: string;
    asset?: {
        ticker: string;
        name: string;
        currentPrice: number;
    };
}

export interface CreateAlertDto {
    assetId: string;
    targetPrice: number;
    condition: AlertCondition;
}

export interface UpdateAlertDto {
    targetPrice?: number;
    condition?: AlertCondition;
    isActive?: boolean;
}
