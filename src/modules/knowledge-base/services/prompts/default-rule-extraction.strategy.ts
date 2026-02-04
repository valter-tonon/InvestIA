import { PromptStrategy } from '../../domain/interfaces/prompt-strategy.interface';

export class DefaultRuleExtractionStrategy implements PromptStrategy {
    name = 'DEFAULT_EXTRACTION';
    description = 'Standard rule extraction from text';

    getSystemPrompt(): string {
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

    getUserPrompt(text: string): string {
        // Limit text size to avoid token limits (Gemini 1.5 Flash has 1M context window)
        const maxChars = 500000;
        const truncatedText = text.length > maxChars ? text.substring(0, maxChars) + '...' : text;

        return `Extract all investment rules from the following text. Return ONLY the JSON object, no additional text.

---
${truncatedText}
---`;
    }
}
