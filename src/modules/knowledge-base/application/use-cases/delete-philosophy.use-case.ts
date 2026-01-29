import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import * as fs from 'fs/promises';

@Injectable()
export class DeletePhilosophyUseCase {
    private readonly logger = new Logger(DeletePhilosophyUseCase.name);

    constructor(private readonly prisma: PrismaService) { }

    async execute(userId: string, id: string): Promise<void> {
        const philosophy = await this.prisma.philosophy.findUnique({
            where: { id },
        });

        if (!philosophy) {
            throw new NotFoundException('Philosophy not found');
        }

        if (philosophy.userId !== userId) {
            throw new NotFoundException('Philosophy not found'); // Security by obscurity
        }

        // Deletar do banco
        await this.prisma.philosophy.delete({
            where: { id },
        });

        // Deletar arquivo
        try {
            await fs.unlink(philosophy.filePath);
            this.logger.log(`File deleted: ${philosophy.filePath}`);
        } catch (error) {
            this.logger.error(`Error deleting file ${philosophy.filePath}: ${error.message}`);
            // Não lançar erro aqui para não falhar a request se o arquivo já sumiu
        }
    }
}
