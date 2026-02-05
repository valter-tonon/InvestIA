export enum AlertCondition {
    ABOVE = 'ABOVE',
    BELOW = 'BELOW',
    EQUAL = 'EQUAL',
}

export interface IPriceAlert {
    id: string;
    userId: string;
    assetId: string;
    targetPrice: number;
    condition: AlertCondition;
    isActive: boolean;
    triggeredAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateAlertProps {
    userId: string;
    assetId: string;
    targetPrice: number;
    condition: AlertCondition;
}
