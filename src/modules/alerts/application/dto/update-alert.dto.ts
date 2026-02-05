import { IsBoolean, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AlertCondition } from '../../domain/interfaces/alert.interface';

export class UpdateAlertDto {
    @ApiPropertyOptional({ description: 'Preço alvo para disparo', example: 45.00 })
    @IsOptional()
    @IsNumber()
    @Min(0.01)
    targetPrice?: number;

    @ApiPropertyOptional({ description: 'Condição do alerta', enum: AlertCondition })
    @IsOptional()
    @IsEnum(AlertCondition)
    condition?: AlertCondition;

    @ApiPropertyOptional({ description: 'Status do alerta', example: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
