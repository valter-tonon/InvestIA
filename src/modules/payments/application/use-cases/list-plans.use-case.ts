import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

export interface ListPlansInput {
    activeOnly?: boolean;
    includeSubscriptionCount?: boolean;
}

@Injectable()
export class ListPlansUseCase {
    constructor(private readonly prisma: PrismaService) { }

    async execute(input: ListPlansInput = {}) {
        const plans = await this.prisma.plan.findMany({
            where: input.activeOnly ? { active: true } : undefined,
            include: input.includeSubscriptionCount
                ? {
                    _count: {
                        select: { subscriptions: true },
                    },
                }
                : undefined,
            orderBy: [
                { active: 'desc' }, // Ativos primeiro
                { price: 'asc' },   // Depois por preço
            ],
        });

        return plans;
    }
}
