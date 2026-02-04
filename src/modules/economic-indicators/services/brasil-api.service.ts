import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

@Injectable()
export class BrasilApiService {
    private readonly logger = new Logger(BrasilApiService.name);
    private readonly baseUrl = 'https://brasilapi.com.br/api';

    constructor(private readonly prisma: PrismaService) { }

    async syncIndicators() {
        this.logger.log('Starting sync of economic indicators...');

        try {
            await Promise.all([
                this.syncSelic(),
                this.syncCDI(),
                this.syncIPCA()
            ]);
            this.logger.log('Economic indicators synced successfully');
        } catch (error) {
            this.logger.error('Error syncing indicators', error);
            throw error;
        }
    }

    private async syncSelic() {
        try {
            // BrasilAPI taxes endpoint: https://brasilapi.com.br/api/taxas/v1/Selic
            const response = await axios.get(`${this.baseUrl}/taxas/v1/Selic`);
            const data = response.data; // { name: 'Selic', valor: 12.75 }

            await this.prisma.economicIndicator.upsert({
                where: { key: 'SELIC' },
                update: {
                    value: data.valor,
                    lastUpdated: new Date(),
                },
                create: {
                    key: 'SELIC',
                    name: 'Taxa Selic',
                    value: data.valor,
                    lastUpdated: new Date(),
                },
            });
            this.logger.log(`Synced SELIC: ${data.valor}%`);
        } catch (e) {
            this.logger.error('Failed to sync SELIC', e);
        }
    }

    private async syncCDI() {
        try {
            // BrasilAPI taxes endpoint: https://brasilapi.com.br/api/taxas/v1/CDI
            const response = await axios.get(`${this.baseUrl}/taxas/v1/CDI`);
            const data = response.data;

            await this.prisma.economicIndicator.upsert({
                where: { key: 'CDI' },
                update: {
                    value: data.valor,
                    lastUpdated: new Date(),
                },
                create: {
                    key: 'CDI',
                    name: 'Taxa CDI',
                    value: data.valor,
                    lastUpdated: new Date(),
                },
            });
            this.logger.log(`Synced CDI: ${data.valor}%`);
        } catch (e) {
            this.logger.error('Failed to sync CDI', e);
        }
    }

    private async syncIPCA() {
        try {
            // BrasilAPI taxes endpoint: https://brasilapi.com.br/api/taxas/v1/IPCA
            // Note: BrasilAPI might mostly list daily rates or specific indices. 
            // If IPCA is not directly available in 'taxas', we might need another source or endpoint.
            // Documentation says 'taxas' endpoint returns Selic, CDI, IPCA. Let's assume it works.
            const response = await axios.get(`${this.baseUrl}/taxas/v1/IPCA`);
            const data = response.data;

            await this.prisma.economicIndicator.upsert({
                where: { key: 'IPCA' },
                update: {
                    value: data.valor,
                    lastUpdated: new Date(),
                },
                create: {
                    key: 'IPCA',
                    name: 'IPCA (Acumulado 12m)',
                    value: data.valor,
                    lastUpdated: new Date(),
                },
            });
            this.logger.log(`Synced IPCA: ${data.valor}%`);
        } catch (e) {
            // IPCA might fail if not in the same endpoint structure
            this.logger.warn('Failed to sync IPCA - attempting alternative or skipping', e.message);
        }
    }
}
