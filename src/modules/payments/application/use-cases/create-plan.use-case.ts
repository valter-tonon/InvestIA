import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { PlanInterval } from '@prisma/client';

export interface CreatePlanInput {
    name: string;
    displayName: string;
    description?: string;
    price: number;
    interval: PlanInterval;
    features?: Record<string, any>;
    active?: boolean;
}

@Injectable()
export class CreatePlanUseCase {
    constructor(private readonly prisma: PrismaService) { }

    async execute(input: CreatePlanInput) {
        // Validar nome único
        const existing = await this.prisma.plan.findUnique({
            where: { name: input.name },
        });

        if (existing) {
            throw new BadRequestException(`Plan with name '${input.name}' already exists`);
        }



        // Criar plano
        const plan = await this.prisma.plan.create({
            data: {
                name: input.name,
                displayName: input.displayName,
                description: input.description || '',
                price: input.price,
                interval: input.interval,

                features: input.features || {},
                active: input.active ?? true,
            },
        });

        return plan;
    }
}
