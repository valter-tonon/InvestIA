import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { PdfExtractorService } from '../../services/pdf-extractor.service';
import { UploadPhilosophyInput } from '../dtos/upload-philosophy.input';
import { PhilosophyOutput } from '../dtos/philosophy.output';

@Injectable()
export class UploadPhilosophyUseCase {
    private readonly logger = new Logger(UploadPhilosophyUseCase.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly pdfExtractor: PdfExtractorService,
    ) { }

    async execute(
        userId: string,
        input: UploadPhilosophyInput,
        file: Express.Multer.File,
    ): Promise<PhilosophyOutput> {
        if (!file) {
            throw new BadRequestException('File is required');
        }

        this.logger.log(`Processing upload for user ${userId}: ${input.title}`);

        try {
            // 1. Extrair texto do PDF
            const extractedText = await this.pdfExtractor.extractText(file.path);

            // 2. Extrair regras
            const rules = this.pdfExtractor.extractRules(extractedText);

            if (rules.length === 0) {
                this.logger.warn(`No rules extracted from file: ${file.originalname}`);
            }

            // 3. Salvar no banco
            const philosophy = await this.prisma.philosophy.create({
                data: {
                    title: input.title,
                    description: input.description,
                    filePath: file.path,
                    extractedText,
                    rules,
                    userId,
                },
            });

            this.logger.log(`Philosophy created with ID: ${philosophy.id}`);

            return PhilosophyOutput.fromEntity(philosophy);
        } catch (error) {
            this.logger.error(`Error processing upload: ${error.message}`);
            // TODO: Apagar arquivo se falhar (opcional, por enquanto deixa no disco para debug ou implementar cleanup)
            throw error;
        }
    }
}
