import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

export interface DeletePlanInput {
    planId: string;
    force?: boolean; // Forçar deleção mesmo com assinaturas
}

@Injectable()
export class DeletePlanUseCase {
    constructor(private readonly prisma: PrismaService) { }

    async execute(input: DeletePlanInput) {
        // Verificar se plano existe
        const plan = await this.prisma.plan.findUnique({
            where: { id: input.planId },
            include: {
                _count: {
                    select: { subscriptions: true },
                },
            },
        });

        if (!plan) {
            throw new NotFoundException('Plan not found');
        }

        //Verificar se há assinaturas ativas
        const activeSubscriptions = await this.prisma.subscription.count({
            where: {
                planId: input.planId,
                status: 'ACTIVE',
            },
        });

        if (activeSubscriptions > 0 && !input.force) {
            throw new BadRequestException(
                `Cannot delete plan with ${activeSubscriptions} active subscription(s). ` +
                'Deactivate the plan instead or use force option.',
            );
        }

        // Se tem assinaturas mas force=true, fazer soft delete (desativar)
        if (plan._count.subscriptions > 0) {
            const updated = await this.prisma.plan.update({
                where: { id: input.planId },
                data: { active: false },
            });

            return {
                deleted: false,
                deactivated: true,
                plan: updated,
            };
        }

        // Sem assinaturas, deletar permanentemente
        await this.prisma.plan.delete({
            where: { id: input.planId },
        });

        return {
            deleted: true,
            deactivated: false,
        };
    }
}
