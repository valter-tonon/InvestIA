import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class DeletePhilosophyUseCase {
    private readonly logger = new Logger(DeletePhilosophyUseCase.name);
    private readonly UPLOADS_DIR = path.resolve(process.cwd(), 'uploads', 'philosophies');

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

        // Deletar arquivo com validação de path traversal
        try {
            // Normalize and resolve the file path
            const normalizedPath = path.normalize(philosophy.filePath);
            const resolvedPath = path.resolve(normalizedPath);

            // Ensure the file is within the uploads directory
            if (!resolvedPath.startsWith(this.UPLOADS_DIR)) {
                this.logger.error(`Path traversal attempt detected: ${philosophy.filePath}`);
                throw new BadRequestException('Invalid file path');
            }

            await fs.unlink(resolvedPath);
            this.logger.log(`File deleted: ${resolvedPath}`);
        } catch (error) {
            this.logger.error(`Error deleting file ${philosophy.filePath}: ${error.message}`);
            // Não lançar erro aqui para não falhar a request se o arquivo já sumiu
        }
    }
}
