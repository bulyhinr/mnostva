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

    async createPaymentIntent(amount: number, currency: string = 'usd', metadata?: Stripe.MetadataParam): Promise<Stripe.PaymentIntent> {
        return this.stripe.paymentIntents.create({
            amount,
            currency,
            metadata,
        });
    }

    constructEvent(payload: string | Buffer, signature: string, secret: string): Stripe.Event {
        try {
            return this.stripe.webhooks.constructEvent(payload, signature, secret);
        } catch (err: any) {
            console.error(`Webhook Error: ${err.message}`);
            throw new Error(`Webhook Error: ${err.message}`);
        }
    }

    async retrievePaymentIntent(id: string): Promise<Stripe.Response<Stripe.PaymentIntent>> {
        return this.stripe.paymentIntents.retrieve(id, {
            expand: ['latest_charge']
        });
    }
}
