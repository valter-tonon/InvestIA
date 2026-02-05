import { IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { AssetType } from '../../domain/enums/asset-type.enum';
import { AssetSector } from '../../domain/enums/asset-sector.enum';
import { Transform } from 'class-transformer';

export class CreateAssetInput {
    @IsNotEmpty({ message: 'Ticker é obrigatório' })
    @IsString()
    @MinLength(4, { message: 'Ticker deve ter no mínimo 4 caracteres' })
    @Transform(({ value }) => value?.toUpperCase())
    ticker: string;

    @IsNotEmpty({ message: 'Nome é obrigatório' })
    @IsString()
    @MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
    name: string;

    @IsEnum(AssetType, { message: 'Tipo inválido. Use: STOCK, REIT, ETF ou BDR' })
    type: AssetType;

    @IsOptional()
    @IsEnum(AssetSector, { message: 'Setor inválido' })
    sector?: AssetSector;
}
