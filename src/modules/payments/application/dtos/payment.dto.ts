import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreatePaymentIntentDto {
    @IsString()
    planId: string;

    @IsNumber()
    @Min(0)
    @IsOptional()
    amount?: number; // Optional - will be fetched from plan if not provided

    @IsString()
    @IsOptional()
    currency?: string;
}

export class CreateSubscriptionDto {
    @IsString()
    planId: string; // Internal plan ID (not Stripe price ID)

    @IsString()
    paymentMethodId: string; // From Stripe Elements

    @IsNumber()
    @Min(0)
    @IsOptional()
    trialDays?: number;
}

export class CancelSubscriptionDto {
    @IsString()
    @IsOptional()
    reason?: string;
}

export class UpdateSubscriptionDto {
    @IsString()
    newPlanId: string;
}
