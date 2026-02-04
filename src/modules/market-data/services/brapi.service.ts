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

export interface BrapiDividend {
    date: string;           // Data de pagamento (YYYY-MM-DD)
    paymentDate: string;    // Data de pagamento
    rate: number;           // Valor por ação
    relatedTo: string;      // Data ex-dividendo
    type: 'DIVIDEND' | 'JCP' | 'JSCP';
}

export interface BrapiDividendsData {
    cashDividends?: BrapiDividend[];
    stockDividends?: any[];
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

    /**
     * Busca histórico de dividendos de um ativo
     * @param ticker Ticker do ativo (ex: PETR4)
     * @param years Número de anos de histórico (padrão: 10)
     */
    async getDividendHistory(ticker: string, years: number = 10): Promise<BrapiDividend[]> {
        try {
            const url = `${this.baseUrl}/quote/${ticker}?range=${years}y&dividends=true`;

            this.logger.log(`Fetching dividend history for: ${ticker} (${years} years)`);

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

            if (!data.results || data.results.length === 0) {
                this.logger.warn(`No data found for ticker: ${ticker}`);
                return [];
            }

            const quote = data.results[0];
            const dividendsData = (quote as any).dividendsData as BrapiDividendsData;

            if (!dividendsData?.cashDividends) {
                this.logger.log(`No dividend history for: ${ticker}`);
                return [];
            }

            this.logger.log(`Found ${dividendsData.cashDividends.length} dividends for ${ticker}`);

            return dividendsData.cashDividends;
        } catch (error) {
            this.logger.error(`Error fetching dividend history: ${error.message}`);
            return [];
        }
    }

    /**
     * Get list of available assets from Brapi
     * @param type Filter by asset type (stock, fund, bdr, etc)
     * @returns Array of available tickers
     */
    async getAvailableAssets(type?: string): Promise<string[]> {
        try {
            let url = `${this.baseUrl}/quote/list`;
            if (type) {
                url += `?type=${type}`;
            }

            this.logger.log(`Fetching available assets${type ? ` (type: ${type})` : ''}`);

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

            const data: { stocks: Array<{ stock: string }> } = await response.json();

            this.logger.log(`Found ${data.stocks?.length || 0} available assets`);

            return data.stocks?.map((s) => s.stock) || [];
        } catch (error) {
            this.logger.error(`Error fetching available assets: ${error.message}`);
            return [];
        }
    }
}
