import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { LlmProvider, LlmResponse, ExtractedRule } from '../../domain/interfaces/llm-provider.interface';

@Injectable()
export class OpenAiProvider implements LlmProvider {
    private readonly logger = new Logger(OpenAiProvider.name);
    private readonly client: OpenAI;
    private readonly model: string;
    private readonly maxTokens: number;
    private readonly temperature: number;

    constructor(private readonly configService: ConfigService) {
        const apiKey = this.configService.get<string>('OPENAI_API_KEY');

        if (!apiKey) {
            this.logger.warn('OpenAI API Key not configured');
        }

        this.client = new OpenAI({ apiKey });
        this.model = this.configService.get<string>('OPENAI_MODEL', 'gpt-4o-mini');
        this.maxTokens = this.configService.get<number>('OPENAI_MAX_TOKENS', 2000);
        this.temperature = this.configService.get<number>('OPENAI_TEMPERATURE', 0.1);
    }

    getName(): string {
        return 'OpenAI';
    }

    async extractRules(text: string): Promise<LlmResponse> {
        let lastError: Error | null = null;
        const maxRetries = 3;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const systemPrompt = this.getSystemPrompt();
                const userPrompt = this.getUserPrompt(text);

                this.logger.log(`Calling OpenAI ${this.model} for rule extraction (attempt ${attempt}/${maxRetries})...`);

                const completion = await this.client.chat.completions.create({
                    model: this.model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt },
                    ],
                    temperature: this.temperature,
                    max_tokens: this.maxTokens,
                    response_format: { type: 'json_object' },
                });

                const content = completion.choices[0]?.message?.content;
                if (!content) {
                    // ERR-001: Use InternalServerErrorException instead of generic Error
                    throw new InternalServerErrorException('Empty response from OpenAI');
                }

                // SEC-008: Safe JSON parsing with try-catch
                let parsed: any;
                try {
                    parsed = JSON.parse(content);
                } catch (parseError) {
                    this.logger.error(`Failed to parse OpenAI response as JSON: ${parseError.message}`);
                    // ERR-001: Use InternalServerErrorException instead of generic Error
                    throw new InternalServerErrorException('Invalid JSON response from OpenAI');
                }

                const rules: ExtractedRule[] = parsed.rules || [];

                this.logger.log(`Extracted ${rules.length} rules using OpenAI (${completion.usage?.total_tokens} tokens)`);

                return {
                    rules,
                    tokensUsed: completion.usage?.total_tokens,
                    model: this.model,
                };
            } catch (error) {
                lastError = error;
                this.logger.warn(`OpenAI extraction attempt ${attempt} failed: ${error.message}`);

                if (attempt < maxRetries) {
                    // Exponential backoff
                    const delay = Math.pow(2, attempt - 1) * 1000;
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        this.logger.error(`All OpenAI extraction attempts failed. Last error: ${lastError?.message}`);
        throw lastError;
    }

    private getSystemPrompt(): string {
        return `You are an expert financial analyst specialized in extracting investment rules from documents and reports.
Your task is to identify and structure investment criteria ("rules") from the provided text.

Extract rules in the following categories:
- check: Fundamental checks (e.g., "Audited", "Has Tag Along", "Listed > 5 years")
- valuation: P/L, P/VP, EV/EBITDA, P/E, Price to Book, etc.
- profitability: ROE, ROIC, Net Margin (Margem Líquida), Gross Margin (Margem Bruta), etc.
- dividend: DY (Dividend Yield), Payout Ratio, Yield on Cost, etc.
- debt: Net Debt/EBITDA (Dívida Líquida/EBITDA), Debt/Equity (Dívida/Patrimônio), Liquidez Corrente, etc.
- growth: Revenue Growth (Crescimento de Receita), CAGR (Lucros ou Receita), etc.
- quality: Governance (Governança), Management (Gestão), Competitive Moat (Vantagens Competitivas), etc.
- other: Any other specific investment criteria mentioned.

For each rule, provide:
1. type: "quantitative" (has numbers) or "qualitative" (subjective/boolean)
2. category: one of the categories above
3. indicator: Standardized name of the metric (e.g., Use "P/L" instead of "Preço sobre Lucro"). Common mappings:
   - "LPA" or "EPS" -> "LPA"
   - "VPA" or "BVS" -> "VPA"
   - "Margem Líquida" -> "Net Margin"
   - "ROE" -> "ROE"
4. operator: <, >, <=, >=, =, or "between" (if quantitative)
5. value: numeric value. IMPORTANT: Convert percentages to decimal (e.g., 10% -> 0.10, 15% -> 0.15). For integer multiples, keep as is (e.g., 10x -> 10).
6. valueMax: maximum value if operator is "between"
7. unit: %, x, R$, or empty string
8. description: concise description of the rule in Portuguese
9. confidence: your confidence score from 0 to 1 based on how explicit the rule is in the text

Return ONLY valid JSON in this exact format:
{
  "rules": [
    {
      "type": "quantitative",
      "category": "valuation",
      "indicator": "P/L",
      "operator": "<",
      "value": 10,
      "unit": "x",
      "description": "P/L deve ser menor que 10x",
      "confidence": 0.95
    },
    {
      "type": "quantitative",
      "category": "profitability",
      "indicator": "ROE",
      "operator": ">=",
      "value": 0.15,
      "unit": "%",
      "description": "ROE acima de 15%",
      "confidence": 0.90
    }
  ]
}`;
    }

    private getUserPrompt(text: string): string {
        // SEC-020: Limit text size to avoid token limits and DoS
        const maxChars = this.configService.get<number>('LLM_MAX_TEXT_SIZE', 10000);
        const truncatedText = text.length > maxChars ? text.substring(0, maxChars) + '...' : text;

        return `Extract all investment rules from the following text. Return ONLY the JSON object, no additional text.

---
${truncatedText}
---`;
    }
}
