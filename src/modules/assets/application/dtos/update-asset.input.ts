import { IsOptional, IsString, MinLength, IsEnum } from 'class-validator';
import { AssetType } from '../../domain/enums/asset-type.enum';
import { AssetSector } from '../../domain/enums/asset-sector.enum';

export class UpdateAssetInput {
    @IsOptional()
    @IsString()
    @MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
    name?: string;

    @IsOptional()
    @IsEnum(AssetType, { message: 'Tipo inválido. Use: STOCK, REIT, ETF ou BDR' })
    type?: AssetType;

    @IsOptional()
    @IsEnum(AssetSector, { message: 'Setor inválido' })
    sector?: AssetSector;
}
