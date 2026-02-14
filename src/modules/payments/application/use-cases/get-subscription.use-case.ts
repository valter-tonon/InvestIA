import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

export interface GetSubscriptionInput {
    userId: string;
}

@Injectable()
export class GetSubscriptionUseCase {
    constructor(private readonly prisma: PrismaService) { }

    async execute(input: GetSubscriptionInput): Promise<any> {
        const subscription = await this.prisma.subscription.findUnique({
            where: { userId: input.userId },
            include: { plan: true },
        });

        if (!subscription) {
            return null;
        }

        return {
            ...subscription,
            plan: {
                ...subscription.plan,
                price: Number(subscription.plan.price),
                interval: subscription.plan.interval,
            },
        };
    }
}
