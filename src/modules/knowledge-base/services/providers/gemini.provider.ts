import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { LlmProvider, LlmResponse, ExtractedRule } from '../../domain/interfaces/llm-provider.interface';

import { PromptService } from '../prompt.service';

@Injectable()
export class GeminiProvider implements LlmProvider {
    private readonly logger = new Logger(GeminiProvider.name);
    private readonly client: GoogleGenerativeAI;
    private readonly model: string;
    private readonly maxTokens?: number;
    private readonly temperature: number;

    constructor(
        private readonly configService: ConfigService,
        private readonly promptService: PromptService
    ) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');

        if (!apiKey) {
            this.logger.warn('Gemini API Key not configured');
        }

        this.client = new GoogleGenerativeAI(apiKey || '');
        this.model = this.configService.get<string>('GEMINI_MODEL', 'gemini-1.5-flash');
        this.maxTokens = this.configService.get<number>('GEMINI_MAX_TOKENS');
        this.temperature = this.configService.get<number>('GEMINI_TEMPERATURE', 0.1);
    }

    getName(): string {
        return 'Google Gemini';
    }

    async extractRules(text: string): Promise<LlmResponse> {
        let lastError: Error | null = null;
        const maxRetries = 3;

        // Get the strategy (currently hardcoded or could be passed via options)
        const strategy = this.promptService.getStrategy('DEFAULT_EXTRACTION');

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const systemPrompt = strategy.getSystemPrompt();
                const userPrompt = strategy.getUserPrompt(text);

                this.logger.log(`Calling Gemini ${this.model} for rule extraction (attempt ${attempt}/${maxRetries})...`);

                const generationConfig: any = {
                    temperature: this.temperature,
                    responseMimeType: 'application/json',
                };

                if (this.maxTokens) {
                    generationConfig.maxOutputTokens = this.maxTokens;
                }

                const model = this.client.getGenerativeModel({
                    model: this.model,
                    generationConfig,
                });

                const result = await model.generateContent([
                    systemPrompt,
                    userPrompt,
                ]);

                const response = result.response;
                const content = response.text();

                if (!content) {
                    // ERR-001: Use InternalServerErrorException instead of generic Error
                    throw new InternalServerErrorException('Empty response from Gemini');
                }

                // SEC-008: Safe JSON parsing with try-catch
                let parsed: any;
                try {
                    parsed = JSON.parse(content);
                } catch (parseError) {
                    this.logger.error(`Failed to parse Gemini response as JSON: ${parseError.message}`);
                    // ERR-001: Use InternalServerErrorException instead of generic Error
                    throw new InternalServerErrorException('Invalid JSON response from Gemini');
                }

                const rules: ExtractedRule[] = parsed.rules || [];

                // Gemini doesn't provide token count in the same way, estimate it
                const estimatedTokens = Math.ceil((systemPrompt.length + userPrompt.length + content.length) / 4);

                this.logger.log(`Extracted ${rules.length} rules using Gemini (~${estimatedTokens} tokens)`);

                return {
                    rules,
                    tokensUsed: estimatedTokens,
                    model: this.model,
                };
            } catch (error) {
                lastError = error;
                this.logger.warn(`Gemini extraction attempt ${attempt} failed: ${error.message}`);

                if (attempt < maxRetries) {
                    // Exponential backoff: 1s, 2s, 4s
                    const delay = Math.pow(2, attempt - 1) * 1000;
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        this.logger.error(`All Gemini extraction attempts failed. Last error: ${lastError?.message}`);
        throw lastError;
    }
}
