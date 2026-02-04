import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsArray, IsNumber, IsString, Min, Max } from 'class-validator';

export class ImportBulkDto {
    @ApiProperty({
        description: 'Specific tickers to import (optional)',
        example: ['PETR4', 'VALE3', 'ITUB4'],
        required: false,
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tickers?: string[];

    @ApiProperty({
        description: 'Maximum number of assets to import',
        example: 100,
        required: false,
        minimum: 1,
        maximum: 500,
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(500)
    limit?: number;

    @ApiProperty({
        description: 'Skip assets updated in the last 24 hours',
        example: true,
        required: false,
        default: true,
    })
    @IsOptional()
    skipRecent?: boolean;
}

export class SearchImportDto {
    @ApiProperty({
        description: 'Ticker symbol to search and import',
        example: 'PETR4',
    })
    @IsString()
    ticker: string;
}

export class ImportResultDto {
    @ApiProperty({ example: 10 })
    created: number;

    @ApiProperty({ example: 5 })
    updated: number;

    @ApiProperty({ example: 2 })
    skipped: number;

    @ApiProperty({ example: 0 })
    errors: number;

    @ApiProperty({
        example: [
            { ticker: 'PETR4', status: 'created' },
            { ticker: 'VALE3', status: 'updated' },
        ],
    })
    details: Array<{
        ticker: string;
        status: 'created' | 'updated' | 'skipped' | 'error';
        message?: string;
    }>;
}
