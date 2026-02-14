import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

export interface GetTransactionsInput {
    userId: string;
    limit?: number;
}

@Injectable()
export class GetTransactionsUseCase {
    constructor(private readonly prisma: PrismaService) { }

    async execute(input: GetTransactionsInput): Promise<any[]> {
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
