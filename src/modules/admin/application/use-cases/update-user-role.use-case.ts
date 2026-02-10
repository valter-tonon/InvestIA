import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { UpdateUserRoleInput } from '../dtos/update-user-role.input';

@Injectable()
export class UpdateUserRoleUseCase {
    constructor(private readonly prisma: PrismaService) { }

    async execute(userId: string, input: UpdateUserRoleInput) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || user.deleted_at) {
            throw new NotFoundException('Usuário não encontrado');
        }

        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: { role: input.role },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                updatedAt: true,
            },
        });

        // Log activity
        await this.prisma.activityLog.create({
            data: {
                userId,
                action: 'USER_ROLE_UPDATED',
                details: {
                    previousRole: user.role,
                    newRole: input.role,
                },
            },
        });

        return updated;
    }
}
