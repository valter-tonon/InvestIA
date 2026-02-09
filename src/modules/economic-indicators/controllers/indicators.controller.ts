import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

@ApiTags('indicators')
@Controller('indicators')
export class IndicatorsController {
    constructor(private readonly prisma: PrismaService) { }

    @Get()
    @UseInterceptors(CacheInterceptor)
    @CacheTTL(24 * 60 * 60 * 1000) // 24 hours in milliseconds
    @ApiOperation({ summary: 'Get current economic indicators (SELIC, CDI, IPCA)' })
    @ApiResponse({ status: 200, description: 'Returns key economic indicators' })
    async getIndicators() {
        const indicators = await this.prisma.economicIndicator.findMany();

        // Transform to easy-to-use object: { SELIC: 12.75, CDI: 12.65, IPCA: 4.5 }
        const result: Record<string, number> = {};

        // Defaults if empty
        result['SELIC'] = 0;
        result['CDI'] = 0;
        result['IPCA'] = 0;

        indicators.forEach(ind => {
            result[ind.key] = ind.value;
        });

        return result;
    }
}
