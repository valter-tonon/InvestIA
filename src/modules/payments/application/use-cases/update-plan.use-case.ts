import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

export interface UpdatePlanInput {
    planId: string;
    displayName?: string;
    description?: string;
    price?: number;
    features?: Record<string, any>;
    active?: boolean;
}

@Injectable()
export class UpdatePlanUseCase {
    constructor(private readonly prisma: PrismaService) { }

    async execute(input: UpdatePlanInput) {
        // Verificar se plano existe
        const plan = await this.prisma.plan.findUnique({
            where: { id: input.planId },
        });

        if (!plan) {
            throw new NotFoundException('Plan not found');
        }



        // Atualizar plano
        const updated = await this.prisma.plan.update({
            where: { id: input.planId },
            data: {
                ...(input.displayName && { displayName: input.displayName }),
                ...(input.description !== undefined && { description: input.description }),
                ...(input.price !== undefined && { price: input.price }),

                ...(input.features && { features: input.features }),
                ...(input.active !== undefined && { active: input.active }),
            },
        });

        return updated;
    }
}
