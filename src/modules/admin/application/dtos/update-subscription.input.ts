import { IsEnum, IsOptional, IsDateString, IsUUID } from 'class-validator';
import { SubscriptionStatus } from '@prisma/client';

export class UpdateSubscriptionInput {
    @IsOptional()
    @IsUUID()
    planId?: string; // ID do plano

    @IsOptional()
    @IsEnum(SubscriptionStatus)
    status?: SubscriptionStatus;

    @IsOptional()
    @IsDateString()
    endDate?: string;
}
