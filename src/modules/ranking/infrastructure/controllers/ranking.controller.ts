import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { RankAssetsUseCase, RankingStrategy } from '../../application/use-cases/rank-assets.use-case';
import { JwtAuthGuard } from '../../../auth';

@ApiTags('ranking')
@Controller('ranking')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class RankingController {
    constructor(private readonly rankAssetsUseCase: RankAssetsUseCase) { }

    @Get()
    @ApiOperation({ summary: 'Get ranked assets based on valuation strategies' })
    @ApiResponse({ status: 200, description: 'List of ranked assets' })
    @ApiQuery({ name: 'strategy', enum: RankingStrategy, required: false })
    @ApiQuery({ name: 'limit', required: false })
    async getRanking(
        @Query('strategy') strategy?: RankingStrategy,
        @Query('limit') limit?: number,
    ) {
        return this.rankAssetsUseCase.execute({
            strategy: strategy || RankingStrategy.COMPOSITE,
            limit: limit ? Number(limit) : 50,
        });
    }
}
