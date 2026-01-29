import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { PhilosophyOutput } from '../dtos/philosophy.output';

@Injectable()
export class ListPhilosophiesUseCase {
    constructor(private readonly prisma: PrismaService) { }

    async execute(userId: string): Promise<PhilosophyOutput[]> {
        const philosophies = await this.prisma.philosophy.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        return philosophies.map(PhilosophyOutput.fromEntity);
    }
}
