import { IsEnum, IsNumber, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AlertCondition } from '../../domain/interfaces/alert.interface';

export class CreateAlertDto {
    @ApiProperty({ description: 'ID do ativo', example: 'uuid-do-ativo' })
    @IsUUID()
    assetId: string;

    @ApiProperty({ description: 'Preço alvo para disparo', example: 42.50 })
    @IsNumber()
    @Min(0.01)
    targetPrice: number;

    @ApiProperty({ description: 'Condição do alerta', enum: AlertCondition, example: 'ABOVE' })
    @IsEnum(AlertCondition)
    condition: AlertCondition;
}
