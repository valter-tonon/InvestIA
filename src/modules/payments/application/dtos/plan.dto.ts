import { IsString, IsNumber, IsEnum, IsOptional, IsBoolean, IsObject, Min } from 'class-validator';
import { PlanInterval } from '@prisma/client';

export class CreatePlanDto {
    @IsString()
    name: string;

    @IsString()
    displayName: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @Min(0)
    price: number;

    @IsEnum(PlanInterval)
    interval: PlanInterval;



    @IsObject()
    @IsOptional()
    features?: Record<string, any>;

    @IsBoolean()
    @IsOptional()
    active?: boolean;
}

export class UpdatePlanDto {
    @IsString()
    @IsOptional()
    displayName?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @Min(0)
    @IsOptional()
    price?: number;



    @IsObject()
    @IsOptional()
    features?: Record<string, any>;

    @IsBoolean()
    @IsOptional()
    active?: boolean;
}
