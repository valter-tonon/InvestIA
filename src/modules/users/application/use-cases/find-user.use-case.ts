import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { UserOutput } from '../dtos';

@Injectable()
export class FindUserUseCase {
    private readonly logger = new Logger(FindUserUseCase.name);

    constructor(private readonly prisma: PrismaService) { }

    async execute(id: string): Promise<UserOutput> {
        this.logger.log(`Finding user with ID: ${id}`);

        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException('Usuário não encontrado');
        }

        return UserOutput.fromEntity(user);
    }
}
