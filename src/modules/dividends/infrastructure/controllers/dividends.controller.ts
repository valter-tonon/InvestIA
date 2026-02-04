import { Controller, Get, Post, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { GetDividendHistoryUseCase } from '../../application/use-cases/get-dividend-history.use-case';
import { SyncDividendsUseCase } from '../../application/use-cases/sync-dividends.use-case';
import { DividendResponseDto } from '../../application/dto/dividend-response.dto';

@ApiTags('dividends')
@Controller('assets/:ticker/dividends')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DividendsController {
    constructor(
        private readonly getDividendHistoryUseCase: GetDividendHistoryUseCase,
        private readonly syncDividendsUseCase: SyncDividendsUseCase,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Get dividend history for an asset' })
    @ApiParam({ name: 'ticker', description: 'Asset ticker (e.g., PETR4)', example: 'PETR4' })
    @ApiQuery({ name: 'years', required: false, description: 'Number of years of history', example: 10 })
    @ApiResponse({ status: 200, description: 'Dividend history retrieved successfully', type: [DividendResponseDto] })
    @ApiResponse({ status: 404, description: 'Asset not found' })
    async getHistory(
        @Param('ticker') ticker: string,
        @Query('years', new ParseIntPipe({ optional: true })) years?: number,
    ) {
        return this.getDividendHistoryUseCase.execute(ticker, years);
    }

    @Post('sync')
    @ApiOperation({ summary: 'Sync dividend history from Brapi' })
    @ApiParam({ name: 'ticker', description: 'Asset ticker (e.g., PETR4)', example: 'PETR4' })
    @ApiResponse({ status: 200, description: 'Dividends synced successfully', type: [DividendResponseDto] })
    @ApiResponse({ status: 404, description: 'Asset not found' })
    async sync(@Param('ticker') ticker: string) {
        return this.syncDividendsUseCase.execute(ticker);
    }
}
