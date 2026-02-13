import {
    Controller,
    Post,
    Body,
    UseGuards,
    Request,
    Get,
    Param,
    Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CreatePaymentIntentUseCase } from '../../application/use-cases/create-payment-intent.use-case';
import { CreateSubscriptionUseCase } from '../../application/use-cases/create-subscription.use-case';
import { CancelSubscriptionUseCase } from '../../application/use-cases/cancel-subscription.use-case';
import { GetSubscriptionUseCase } from '../../application/use-cases/get-subscription.use-case';
import { GetTransactionsUseCase } from '../../application/use-cases/get-transactions.use-case';
import { ListPlansUseCase } from '../../application/use-cases/list-plans.use-case';
import {
    CreatePaymentIntentDto,
    CreateSubscriptionDto,
    CancelSubscriptionDto,
} from '../../application/dtos/payment.dto';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
    constructor(
        private readonly createPaymentIntent: CreatePaymentIntentUseCase,
        private readonly createSubscription: CreateSubscriptionUseCase,
        private readonly cancelSubscription: CancelSubscriptionUseCase,
        private readonly getSubscription: GetSubscriptionUseCase,
        private readonly getTransactions: GetTransactionsUseCase,
        private readonly listPlans: ListPlansUseCase,
    ) { }

    /**
     * Create a payment intent for one-time payment
     * Returns client secret for Stripe Elements
     */
    @Post('create-intent')
    async createIntent(
        @Request() req,
        @Body() body: CreatePaymentIntentDto,
    ) {
        return this.createPaymentIntent.execute({
            userId: req.user.id,
            planId: body.planId,
            amount: body.amount,
            currency: body.currency,
        });
    }

    /**
     * Create a subscription (recurring payment)
     */
    @Post('create-subscription')
    async createSub(
        @Request() req,
        @Body() body: CreateSubscriptionDto,
    ) {
        return this.createSubscription.execute({
            userId: req.user.id,
            planId: body.planId,
            paymentMethodId: body.paymentMethodId,
            trialDays: body.trialDays,
        });
    }

    /**
     * Cancel user's subscription
     */
    @Post('cancel-subscription')
    async cancel(
        @Request() req,
        @Body() body: CancelSubscriptionDto,
    ) {
        await this.cancelSubscription.execute({
            userId: req.user.id,
            reason: body.reason,
        });

        return { success: true };
    }

    /**
     * Get list of active plans (public, JWT required)
     */
    @Get('plans')
    async listPlans(
        @Query('activeOnly') activeOnly?: string,
    ) {
        return this.listPlans.execute({
            activeOnly: activeOnly === 'true',
        });
    }

    /**
     * Get current subscription status
     */
    @Get('subscription')
    async getSubscriptionStatus(@Request() req) {
        return this.getSubscription.execute({
            userId: req.user.id,
        });
    }

    /**
     * Get transaction history
     */
    @Get('transactions')
    async getTransactionHistory(
        @Request() req,
        @Query('limit') limit?: string,
    ) {
        return this.getTransactions.execute({
            userId: req.user.id,
            limit: limit ? parseInt(limit, 10) : 50,
        });
    }
}
