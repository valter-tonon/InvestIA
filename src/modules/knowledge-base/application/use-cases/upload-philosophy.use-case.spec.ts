import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UploadPhilosophyUseCase } from './upload-philosophy.use-case';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { PdfExtractorService } from '../../services/pdf-extractor.service';
import { RuleExtractionService } from '../../services/rule-extraction.service';

describe('UploadPhilosophyUseCase', () => {
    let useCase: UploadPhilosophyUseCase;
    let prismaService: jest.Mocked<PrismaService>;
    let pdfExtractor: jest.Mocked<PdfExtractorService>;
    let ruleExtraction: jest.Mocked<RuleExtractionService>;

    beforeEach(async () => {
        const mockPrismaService = {
            philosophy: {
                create: jest.fn(),
            },
        };

        const mockPdfExtractor = {
            extractText: jest.fn(),
        };

        const mockRuleExtraction = {
            extractRules: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UploadPhilosophyUseCase,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: PdfExtractorService, useValue: mockPdfExtractor },
                { provide: RuleExtractionService, useValue: mockRuleExtraction },
            ],
        }).compile();

        useCase = module.get<UploadPhilosophyUseCase>(UploadPhilosophyUseCase);
        prismaService = module.get(PrismaService);
        pdfExtractor = module.get(PdfExtractorService);
        ruleExtraction = module.get(RuleExtractionService);
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        const mockFile = {
            path: '/tmp/upload.pdf',
            originalname: 'upload.pdf',
        } as Express.Multer.File;

        const input = {
            title: 'Test Philosophy',
            description: 'Description',
        };

        it('should upload and process file successfully', async () => {
            // Arrange
            const extractedText = 'Extracted text content';
            const extractionResult = {
                rules: ['Rule 1', 'Rule 2'],
                structuredRules: [{ description: 'Rule 1', /* ... */ }] as any,
            };
            const createdPhilosophy = {
                id: 'philosophy-123',
                title: input.title,
                rules: extractionResult.rules,
                // ... other fields
            };

            pdfExtractor.extractText.mockResolvedValue(extractedText);
            ruleExtraction.extractRules.mockResolvedValue(extractionResult);
            prismaService.philosophy.create.mockResolvedValue(createdPhilosophy as any);

            // Act
            const result = await useCase.execute('user-123', input, mockFile);

            // Assert
            expect(result.id).toBe(createdPhilosophy.id);
            expect(pdfExtractor.extractText).toHaveBeenCalledWith(mockFile.path);
            expect(ruleExtraction.extractRules).toHaveBeenCalledWith(extractedText);
            expect(prismaService.philosophy.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    title: input.title,
                    extractedText: extractedText,
                    userId: 'user-123',
                }),
            }));
        });

        it('should throw BadRequestException when file is missing', async () => {
            await expect(useCase.execute('user-123', input, null)).rejects.toThrow(BadRequestException);
            expect(pdfExtractor.extractText).not.toHaveBeenCalled();
        });
    });
});
