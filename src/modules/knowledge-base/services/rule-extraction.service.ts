import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LlmProvider, LlmResponse, ExtractedRule } from '../domain/interfaces/llm-provider.interface';
import { OpenAiProvider } from './providers/openai.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { PdfExtractorService } from './pdf-extractor.service';

@Injectable()
export class RuleExtractionService {
    private readonly logger = new Logger(RuleExtractionService.name);
    private readonly provider: LlmProvider;
    private readonly useLlm: boolean;

    constructor(
        private readonly configService: ConfigService,
        private readonly openAiProvider: OpenAiProvider,
        private readonly geminiProvider: GeminiProvider,
        private readonly pdfExtractor: PdfExtractorService,
    ) {
        const providerName = this.configService.get<string>('LLM_PROVIDER', 'gemini');

        // Select provider based on configuration
        if (providerName === 'openai') {
            this.provider = this.openAiProvider;
        } else if (providerName === 'gemini') {
            this.provider = this.geminiProvider;
        } else {
            this.logger.warn(`Unknown LLM provider: ${providerName}, defaulting to Gemini`);
            this.provider = this.geminiProvider;
        }

        // Check if we should use LLM (if API key is configured)
        const hasOpenAiKey = !!this.configService.get<string>('OPENAI_API_KEY');
        const hasGeminiKey = !!this.configService.get<string>('GEMINI_API_KEY');
        this.useLlm = (providerName === 'openai' && hasOpenAiKey) || (providerName === 'gemini' && hasGeminiKey);

        if (!this.useLlm) {
            this.logger.warn('No LLM API key configured, will use regex fallback');
        } else {
            this.logger.log(`Using ${this.provider.getName()} for rule extraction`);
        }
    }

    async extractRules(text: string): Promise<{ rules: string[]; structuredRules?: ExtractedRule[] }> {
        try {
            if (this.useLlm) {
                return await this.extractWithLlm(text);
            } else {
                return this.extractWithRegex(text);
            }
        } catch (error) {
            this.logger.error(`LLM extraction failed, falling back to regex: ${error.message}`);
            return this.extractWithRegex(text);
        }
    }

    private async extractWithLlm(text: string): Promise<{ rules: string[]; structuredRules: ExtractedRule[] }> {
        this.logger.log(`Extracting rules with ${this.provider.getName()}...`);

        const response: LlmResponse = await this.provider.extractRules(text);
        const structuredRules = response.rules;

        // Convert structured rules to simple string array for backward compatibility
        const rules = structuredRules.map(rule => rule.description);

        this.logger.log(
            `Extracted ${structuredRules.length} rules (${response.tokensUsed} tokens, model: ${response.model})`
        );

        return { rules, structuredRules };
    }

    private extractWithRegex(text: string): { rules: string[]; structuredRules?: undefined } {
        this.logger.log('Extracting rules with regex fallback...');

        const rules = this.pdfExtractor.extractRules(text);

        return { rules };
    }

    /**
     * Validate extracted rules to ensure they meet quality standards
     */
    validateRules(rules: ExtractedRule[]): ExtractedRule[] {
        return rules.filter(rule => {
            // Filter out low confidence rules
            if (rule.confidence < 0.5) {
                this.logger.warn(`Filtered out low confidence rule: ${rule.description}`);
                return false;
            }

            // Ensure quantitative rules have required fields
            if (rule.type === 'quantitative') {
                if (!rule.indicator || !rule.operator || rule.value === undefined) {
                    this.logger.warn(`Invalid quantitative rule: ${rule.description} (missing fields)`);
                    return false;
                }

                if (rule.operator === 'between' && rule.valueMax === undefined) {
                    this.logger.warn(`Invalid quantitative rule: ${rule.description} (between operator missing valueMax)`);
                    return false;
                }
            }

            return true;
        });
    }
}
