export interface IDividend {
    id: string;
    assetId: string;
    paymentDate: Date;
    exDate: Date;
    value: number;
    type: 'DIVIDEND' | 'JCP';
    createdAt: Date;
    updatedAt: Date;
}
