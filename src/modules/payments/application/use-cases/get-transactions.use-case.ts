import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

export interface GetTransactionsInput {
    userId: string;
    limit?: number;
}

export interface TransactionOutput {
    id: string;
    userId: string;
    subscriptionId: string | null;
    gateway: string;
    gatewayTxId: string | null;
    amount: number;
    currency: string;
    status: string;
    type: string;
    metadata: Record<string, unknown> | null;
    errorMessage: string | null;
    createdAt: Date;
    updatedAt: Date;
    processedAt: Date | null;
}

@Injectable()
export class GetTransactionsUseCase {
    constructor(private readonly prisma: PrismaService) { }

    async execute(input: GetTransactionsInput): Promise<TransactionOutput[]> {
        const transactions = await this.prisma.transaction.findMany({
            where: { userId: input.userId },
            orderBy: { createdAt: 'desc' },
            take: input.limit || 50,
        });

        return transactions.map(tx => ({
            ...tx,
            amount: Number(tx.amount),
        }));
    }
}
