import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface BrapiQuote {
    symbol: string;
    regularMarketPrice: number;
    regularMarketDayHigh?: number;
    regularMarketDayLow?: number;
    dividendsData?: {
        yield?: number;
    };
    summaryProfile?: {
        sector?: string;
    };
    defaultKeyStatistics?: {
        priceToBook?: number;
        trailingPE?: number;
        returnOnEquity?: number;
        profitMargins?: number;
        debtToEquity?: number;
    };
}

export interface BrapiResponse {
    results: BrapiQuote[];
    requestedAt: string;
    took: string;
}

@Injectable()
export class BrapiService {
    private readonly logger = new Logger(BrapiService.name);
    private readonly baseUrl: string;
    private readonly token: string;

    constructor(private readonly configService: ConfigService) {
        this.baseUrl = this.configService.get('BRAPI_BASE_URL') || 'https://brapi.dev/api';
        this.token = this.configService.get('BRAPI_TOKEN') || '';
    }

    async getQuote(ticker: string): Promise<BrapiQuote | null> {
        const quotes = await this.getQuotes([ticker]);
        return quotes.length > 0 ? quotes[0] : null;
    }

    async getQuotes(tickers: string[]): Promise<BrapiQuote[]> {
        try {
            const tickersParam = tickers.join(',');
            const url = `${this.baseUrl}/quote/${tickersParam}?fundamental=true&dividends=true`;

            this.logger.log(`Fetching quotes for: ${tickersParam}`);

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };

            if (this.token) {
                headers['Authorization'] = `Bearer ${this.token}`;
            }

            const response = await fetch(url, { headers });

            if (!response.ok) {
                this.logger.error(`Brapi API error: ${response.status} ${response.statusText}`);
                return [];
            }

            const data: BrapiResponse = await response.json();

            this.logger.log(`Fetched ${data.results.length} quotes in ${data.took}`);

            return data.results;
        } catch (error) {
            this.logger.error(`Error fetching quotes: ${error.message}`);
            return [];
        }
    }

    mapQuoteToIndicators(quote: BrapiQuote) {
        return {
            currentPrice: quote.regularMarketPrice || null,
            dividendYield: quote.dividendsData?.yield
                ? quote.dividendsData.yield / 100 // Brapi retorna em %, converter para decimal
                : null,
            priceToEarnings: quote.defaultKeyStatistics?.trailingPE || null,
            priceToBook: quote.defaultKeyStatistics?.priceToBook || null,
            roe: quote.defaultKeyStatistics?.returnOnEquity || null,
            netMargin: quote.defaultKeyStatistics?.profitMargins || null,
            debtToEquity: quote.defaultKeyStatistics?.debtToEquity || null,
            lastUpdated: new Date(),
        };
    }
}
