export interface Dividend {
    id: string;
    paymentDate: string;
    exDate: string;
    value: number;
    type: 'DIVIDEND' | 'JCP';
    createdAt: string;
    updatedAt: string;
}

export interface DividendSummary {
    totalCurrentYear: number;
    totalLast12Months: number;
    averageYield: number;
    paymentFrequency: string;
}
