import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

@Injectable()
export class SuspendUserUseCase {
    constructor(private readonly prisma: PrismaService) { }

    async execute(userId: string, suspend: boolean) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('Usuário não encontrado');
        }

        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: {
                deleted_at: suspend ? new Date() : null,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                deleted_at: true,
                updatedAt: true,
            },
        });

        // Log activity
        await this.prisma.activityLog.create({
            data: {
                userId,
                action: suspend ? 'USER_SUSPENDED' : 'USER_REACTIVATED',
                details: {
                    userName: user.name,
                    userEmail: user.email,
                },
            },
        });

        return updated;
    }
}
