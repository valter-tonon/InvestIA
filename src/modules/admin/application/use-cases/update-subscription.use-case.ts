import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { UpdateSubscriptionInput } from '../dtos/update-subscription.input';

@Injectable()
export class UpdateSubscriptionUseCase {
    constructor(private readonly prisma: PrismaService) { }

    async execute(subscriptionId: string, input: UpdateSubscriptionInput) {
        const subscription = await this.prisma.subscription.findUnique({
            where: { id: subscriptionId },
            include: {
                plan: { select: { id: true, name: true, displayName: true } },
                user: { select: { id: true, email: true, name: true } }
            },
        });

        if (!subscription) {
            throw new NotFoundException('Assinatura não encontrada');
        }

        const updateData: Record<string, unknown> = {};

        if (input.planId !== undefined) {
            updateData.planId = input.planId;
        }

        if (input.status !== undefined) {
            updateData.status = input.status;
        }

        if (input.endDate !== undefined) {
            updateData.endDate = new Date(input.endDate);
        }

        const updated = await this.prisma.subscription.update({
            where: { id: subscriptionId },
            data: updateData,
            include: {
                plan: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
            },
        });

        // Log activity
        await this.prisma.activityLog.create({
            data: {
                userId: subscription.userId,
                action: 'SUBSCRIPTION_UPDATED',
                details: {
                    subscriptionId,
                    changes: { ...input },
                    previousPlan: subscription.plan.name,
                    newPlan: updated.plan.name,
                    previousStatus: subscription.status,
                } as any,
            },
        });

        return updated;
    }
}
