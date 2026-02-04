export interface ExtractedRule {
    type: 'quantitative' | 'qualitative';
    category: 'valuation' | 'profitability' | 'dividend' | 'debt' | 'quality' | 'growth' | 'other';
    indicator?: string; // 'P/L', 'ROE', 'DY', etc.
    operator?: '<' | '>' | '<=' | '>=' | '=' | 'between';
    value?: number;
    valueMax?: number; // For 'between' operator
    unit?: '%' | 'x' | 'R$' | '';
    description: string; // Original text from PDF
    confidence: number; // 0-1, LLM confidence score
}

export interface LlmResponse {
    rules: ExtractedRule[];
    tokensUsed?: number;
    model?: string;
}

export interface LlmProvider {
    extractRules(text: string): Promise<LlmResponse>;
    getName(): string;
}
