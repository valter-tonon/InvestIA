import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

export interface GetSubscriptionInput {
    userId: string;
}

export interface SubscriptionOutput {
    id: string;
    userId: string;
    planId: string;
    status: string;
    startDate: Date;
    endDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
    plan: {
        id: string;
        name: string;
        displayName: string;
        description: string | null;
        price: number;
        interval: string;
        features: Record<string, unknown>;
        maxAssets: number | null;
        maxWallets: number | null;
        maxAlerts: number | null;
        aiAnalysis: boolean;
        prioritySupport: boolean;
        customizable: boolean;
        active: boolean;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
    };
}

@Injectable()
export class GetSubscriptionUseCase {
    constructor(private readonly prisma: PrismaService) { }

    async execute(input: GetSubscriptionInput): Promise<SubscriptionOutput | null> {
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
            },
        };
    }
}
