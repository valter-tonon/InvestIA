import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { RuleExtractionService } from './rule-extraction.service';
import { GeminiProvider } from './providers/gemini.provider';
import { OpenAiProvider } from './providers/openai.provider';
import { PdfExtractorService } from './pdf-extractor.service';
import { PromptService } from './prompt.service';

// Mock dependências
const mockConfigService = {
    get: jest.fn((key, defaultValue) => {
        if (key === 'LLM_PROVIDER') return 'gemini';
        if (key === 'GEMINI_API_KEY') return 'fake-key';
        return defaultValue;
    }),
};

const mockPdfExtractor = {
    extractRules: jest.fn(),
};

describe('RuleExtractionService', () => {
    let service: RuleExtractionService;
    let geminiProvider: GeminiProvider;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RuleExtractionService,
                { provide: ConfigService, useValue: mockConfigService },
                { provide: PdfExtractorService, useValue: mockPdfExtractor },
                {
                    provide: PromptService,
                    useValue: {
                        getStrategy: jest.fn().mockReturnValue({
                            getSystemPrompt: jest.fn().mockReturnValue('system prompt'),
                            getUserPrompt: jest.fn().mockReturnValue('user prompt')
                        })
                    }
                }, // Mock PromptService with valid strategy
                {
                    provide: GeminiProvider,
                    useFactory: (config, promptService) => new GeminiProvider(config, promptService),
                    inject: [ConfigService, PromptService] // Inject PromptService
                },
                {
                    provide: OpenAiProvider,
                    useValue: { getName: () => 'OpenAI' }
                }
            ],
        }).compile();

        service = module.get<RuleExtractionService>(RuleExtractionService);
        geminiProvider = module.get<GeminiProvider>(GeminiProvider);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('Validation Logic', () => {
        it('should filter out rules with missing required fields', () => {
            const invalidRules = [
                {
                    description: 'Invalid',
                    confidence: 0.9,
                    type: 'quantitative',
                    // Missing indicator, operator, value
                },
                {
                    description: 'Valid',
                    confidence: 0.9,
                    type: 'quantitative',
                    indicator: 'P/L',
                    operator: '<',
                    value: 10,
                    unit: 'x',
                    category: 'valuation'
                }
            ];

            // @ts-ignore
            const result = service.validateRules(invalidRules);
            expect(result).toHaveLength(1);
            expect(result[0].description).toBe('Valid');
        });

        it('should filter out between operator without valueMax', () => {
            const rules = [
                {
                    description: 'Invalid Between',
                    confidence: 0.9,
                    type: 'quantitative',
                    indicator: 'ROE',
                    operator: 'between',
                    value: 10,
                    // Missing valueMax
                    category: 'profitability'
                }
            ];

            // @ts-ignore
            const result = service.validateRules(rules);
            expect(result).toHaveLength(0);
        });
    });

    describe('Retry Logic (via Provider Mock)', () => {
        it('should retry 3 times before failing', async () => {
            // Mock the client inside provider to throw error
            const mockGenerateContent = jest.fn().mockRejectedValue(new Error('API Error'));

            // Inject mock into provider instance
            // @ts-ignore
            geminiProvider.client = {
                getGenerativeModel: () => ({
                    generateContent: mockGenerateContent
                })
            };

            // Mock logger to avoid console spam
            jest.spyOn(Logger.prototype, 'error').mockImplementation(() => { });
            jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => { });

            await expect(geminiProvider.extractRules('test text'))
                .rejects.toThrow('API Error');

            expect(mockGenerateContent).toHaveBeenCalledTimes(3);
        }, 10000); // Increase timeout for backoff
    });
});
