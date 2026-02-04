import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs/promises';
// @ts-ignore
const pdf = require('pdf-parse');

@Injectable()
export class PdfExtractorService {
    private readonly logger = new Logger(PdfExtractorService.name);

    async extractText(filePath: string): Promise<string> {
        try {
            const dataBuffer = await fs.readFile(filePath);
            const data = await pdf(dataBuffer);

            this.logger.log(`Extracted ${data.numpages} pages from ${filePath}`);

            return data.text;
        } catch (error) {
            this.logger.error(`Error extracting text from PDF: ${error.message}`);
            // ERR-001: Use InternalServerErrorException instead of generic Error
            throw new InternalServerErrorException('Failed to extract text from PDF');
        }
    }

    extractRules(text: string): string[] {
        const rules: string[] = [];

        // Normalizar texto
        const normalizedText = text.toLowerCase();

        // Padrões para identificar regras
        const patterns = [
            // P/L (Price to Earnings)
            /p\/l\s*[<>≤≥=]\s*\d+(\.\d+)?/gi,
            /price\s*to\s*earnings?\s*[<>≤≥=]\s*\d+(\.\d+)?/gi,

            // DY (Dividend Yield)
            /d\.?y\.?\s*[<>≤≥=]\s*\d+(\.\d+)?%?/gi,
            /dividend\s*yield\s*[<>≤≥=]\s*\d+(\.\d+)?%?/gi,

            // ROE (Return on Equity)
            /roe\s*[<>≤≥=]\s*\d+(\.\d+)?%?/gi,
            /return\s*on\s*equity\s*[<>≤≥=]\s*\d+(\.\d+)?%?/gi,

            // P/VP (Price to Book)
            /p\/vp\s*[<>≤≥=]\s*\d+(\.\d+)?/gi,
            /price\s*to\s*book\s*[<>≤≥=]\s*\d+(\.\d+)?/gi,

            // Dívida/Patrimônio
            /d[ií]vida\s*\/\s*patrim[ôo]nio\s*[<>≤≥=]\s*\d+(\.\d+)?/gi,
            /debt\s*to\s*equity\s*[<>≤≥=]\s*\d+(\.\d+)?/gi,

            // Margem Líquida
            /margem\s*l[íi]quida\s*[<>≤≥=]\s*\d+(\.\d+)?%?/gi,
            /net\s*margin\s*[<>≤≥=]\s*\d+(\.\d+)?%?/gi,
        ];

        // Extrair regras usando padrões
        for (const pattern of patterns) {
            const matches = text.match(pattern);
            if (matches) {
                rules.push(...matches.map(m => m.trim()));
            }
        }

        // Remover duplicatas
        const uniqueRules = [...new Set(rules)];

        this.logger.log(`Extracted ${uniqueRules.length} rules from text`);

        return uniqueRules;
    }
}
