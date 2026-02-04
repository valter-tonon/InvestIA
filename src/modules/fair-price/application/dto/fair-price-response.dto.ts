import { ApiProperty } from '@nestjs/swagger';

class FairPriceCalculationDto {
    @ApiProperty({ example: 'bazin' })
    method: string;

    @ApiProperty({ example: 45.5 })
    price: number;

    @ApiProperty({ example: 'Conservador - DY 6%' })
    description: string;
}

class FairPriceCalculationsDto {
    @ApiProperty({ type: FairPriceCalculationDto })
    bazin: FairPriceCalculationDto;

    @ApiProperty({ type: FairPriceCalculationDto })
    barsi: FairPriceCalculationDto;

    @ApiProperty({ type: FairPriceCalculationDto })
    graham: FairPriceCalculationDto;
}

export class FairPriceResponseDto {
    @ApiProperty({ example: 'uuid' })
    assetId: string;

    @ApiProperty({ example: 'PETR4' })
    ticker: string;

    @ApiProperty({ example: 42.0, nullable: true })
    currentPrice: number | null;

    @ApiProperty({ type: FairPriceCalculationsDto })
    calculations: FairPriceCalculationsDto;

    @ApiProperty({ example: 'COMPRA', enum: ['COMPRA', 'VENDA', 'NEUTRO'] })
    recommendation: string;

    @ApiProperty({ example: 45.5 })
    lowestPrice: number;

    @ApiProperty({ example: 52.3 })
    highestPrice: number;

    @ApiProperty({ example: 8.5, nullable: true })
    yieldOnCost: number | null;

    @ApiProperty({ example: 35.0, nullable: true })
    averagePurchasePrice: number | null;
}
