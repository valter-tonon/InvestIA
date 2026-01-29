import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface MarketQuote {
    ticker: string;
    regularMarketPrice: number;
    dividendYield?: number;
    priceEarnings?: number;
    priceToBook?: number;
    roe?: number;
    netMargin?: number;
    debtEquity?: number;
}

@Injectable()
export class MarketDataService {
    private readonly logger = new Logger(MarketDataService.name);
    private readonly brapiToken: string;

    constructor(private configService: ConfigService) {
        this.brapiToken = this.configService.get<string>('BRAPI_TOKEN', '');
    }

    /**
     * Busca cotação e indicadores de um ativo via Brapi
     */
    async fetchQuote(ticker: string): Promise<MarketQuote | null> {
        try {
            const url = `https://brapi.dev/api/quote/${ticker}`;
            const params = this.brapiToken ? { token: this.brapiToken } : {};

            const response = await axios.get(url, { params });
            const data = response.data?.results?.[0];

            if (!data) {
                this.logger.warn(`Nenhum dado encontrado para ${ticker}`);
                return null;
            }

            return {
                ticker: data.symbol,
                regularMarketPrice: data.regularMarketPrice,
                dividendYield: data.dividendYield,
                priceEarnings: data.priceEarningsRatio,
                priceToBook: data.priceToBookRatio,
                roe: data.returnOnEquity,
                netMargin: data.netMargin,
                debtEquity: data.debtEquity,
            };
        } catch (error) {
            this.logger.error(`Erro ao buscar cotação de ${ticker}:`, error.message);
            return null;
        }
    }

    /**
     * Busca cotações para múltiplos ativos
     */
    async fetchMultipleQuotes(tickers: string[]): Promise<MarketQuote[]> {
        const results: MarketQuote[] = [];

        for (const ticker of tickers) {
            const quote = await this.fetchQuote(ticker);
            if (quote) {
                results.push(quote);
            }
            // Delay para respeitar rate limit da API
            await this.delay(200);
        }

        return results;
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
