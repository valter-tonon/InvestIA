import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { UpdateUserInput, UserOutput } from '../dtos';

@Injectable()
export class UpdateUserUseCase {
    private readonly logger = new Logger(UpdateUserUseCase.name);

    constructor(private readonly prisma: PrismaService) { }

    async execute(id: string, input: UpdateUserInput): Promise<UserOutput> {
        this.logger.log(`Updating user with ID: ${id}`);

        // Verificar se usuário existe
        const existingUser = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!existingUser) {
            throw new NotFoundException('Usuário não encontrado');
        }

        const user = await this.prisma.user.update({
            where: { id },
            data: {
                name: input.name,
            },
        });

        this.logger.log(`User updated: ${user.id}`);
        return UserOutput.fromEntity(user);
    }
}
