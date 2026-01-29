import { IsOptional, IsNumber, Min, Max } from 'class-validator';

export class UpdateIndicatorsInput {
    @IsOptional()
    @IsNumber()
    @Min(0, { message: 'Preço deve ser positivo' })
    currentPrice?: number;

    @IsOptional()
    @IsNumber()
    @Min(0, { message: 'Dividend Yield deve ser entre 0 e 1' })
    @Max(1, { message: 'Dividend Yield deve ser entre 0 e 1' })
    dividendYield?: number;

    @IsOptional()
    @IsNumber()
    @Min(0, { message: 'P/L deve ser positivo' })
    priceToEarnings?: number;

    @IsOptional()
    @IsNumber()
    @Min(0, { message: 'P/VP deve ser positivo' })
    priceToBook?: number;

    @IsOptional()
    @IsNumber()
    @Min(-1, { message: 'ROE deve ser entre -1 e 1' })
    @Max(1, { message: 'ROE deve ser entre -1 e 1' })
    roe?: number;

    @IsOptional()
    @IsNumber()
    @Min(-1, { message: 'Margem Líquida deve ser entre -1 e 1' })
    @Max(1, { message: 'Margem Líquida deve ser entre -1 e 1' })
    netMargin?: number;

    @IsOptional()
    @IsNumber()
    @Min(0, { message: 'Dívida/PL deve ser positivo' })
    debtToEquity?: number;
}
