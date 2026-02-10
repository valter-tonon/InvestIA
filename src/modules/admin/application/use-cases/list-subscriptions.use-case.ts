import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { ListSubscriptionsInput } from '../dtos/list-subscriptions.input';
import { Prisma } from '@prisma/client';

@Injectable()
export class ListSubscriptionsUseCase {
    constructor(private readonly prisma: PrismaService) { }

    async execute(input: ListSubscriptionsInput) {
        const { page = 1, perPage = 20, planId, status } = input;
        const skip = (page - 1) * perPage;

        const where: Prisma.SubscriptionWhereInput = {};

        if (planId) {
            where.planId = planId;
        }

        if (status) {
            where.status = status;
        }

        const [subscriptions, total] = await Promise.all([
            this.prisma.subscription.findMany({
                where,
                skip,
                take: perPage,
                orderBy: { createdAt: 'desc' },
                include: {
                    plan: {
                        select: {
                            id: true,
                            name: true,
                            displayName: true,
                            price: true,
                            interval: true,
                        },
                    },
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            role: true,
                        },
                    },
                },
            }),
            this.prisma.subscription.count({ where }),
        ]);

        return {
            data: subscriptions,
            meta: {
                total,
                page,
                perPage,
                lastPage: Math.ceil(total / perPage),
            },
        };
    }
}
