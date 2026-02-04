import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CalculateFairPriceUseCase } from '../../application/use-cases/calculate-fair-price.use-case';
import { FairPriceResponseDto } from '../../application/dto/fair-price-response.dto';

@ApiTags('Fair Price')
@Controller('assets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FairPriceController {
    constructor(
        private readonly calculateFairPriceUseCase: CalculateFairPriceUseCase,
    ) { }

    @Get(':id/fair-price')
    @ApiOperation({ summary: 'Calculate fair price for an asset' })
    @ApiResponse({
        status: 200,
        description: 'Fair price calculated successfully',
        type: FairPriceResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Asset not found' })
    async getFairPrice(@Param('id') id: string): Promise<FairPriceResponseDto> {
        return this.calculateFairPriceUseCase.execute(id);
    }
}
