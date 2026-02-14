import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
    private stripe: Stripe;

    constructor(private configService: ConfigService) {
        const stripeKey = this.configService.getOrThrow<string>('STRIPE_SECRET_KEY');
        this.stripe = new Stripe(stripeKey, {
            apiVersion: '2025-01-27.acacia' as any,
        });
    }

    async createPaymentIntent(amount: number, currency: string = 'usd'): Promise<Stripe.PaymentIntent> {
        return this.stripe.paymentIntents.create({
            amount,
            currency,
        });
    }
}
