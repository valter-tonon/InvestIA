import { IsOptional, IsInt, Min, Max, IsEnum, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { SubscriptionStatus } from '@prisma/client';

export class ListSubscriptionsInput {
    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    page?: number = 1;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100)
    @Type(() => Number)
    perPage?: number = 20;

    @IsOptional()
    @IsUUID()
    planId?: string; // Filtrar por ID do plano

    @IsOptional()
    @IsEnum(SubscriptionStatus)
    status?: SubscriptionStatus;
}
