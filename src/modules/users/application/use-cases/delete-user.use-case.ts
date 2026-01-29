import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

@Injectable()
export class DeleteUserUseCase {
    private readonly logger = new Logger(DeleteUserUseCase.name);

    constructor(private readonly prisma: PrismaService) { }

    async execute(id: string): Promise<void> {
        this.logger.log(`Deleting user with ID: ${id}`);

        // Verificar se usuário existe
        const existingUser = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!existingUser) {
            throw new NotFoundException('Usuário não encontrado');
        }

        await this.prisma.user.delete({
            where: { id },
        });

        this.logger.log(`User deleted: ${id}`);
    }
}
