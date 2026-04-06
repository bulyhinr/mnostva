import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
    private stripe: Stripe;
    private readonly paypalApiBase: string;

    constructor(private configService: ConfigService) {
        const stripeKey = this.configService.getOrThrow<string>('STRIPE_SECRET_KEY');
        this.stripe = new Stripe(stripeKey, {
            apiVersion: '2025-01-27.acacia' as any,
        });
        
        this.paypalApiBase = this.configService.get<string>('PAYPAL_API_BASE', 'https://api-m.sandbox.paypal.com');
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

    // PayPal Methods
    private async generatePayPalAccessToken(): Promise<string> {
        const clientId = this.configService.getOrThrow<string>('PAYPAL_CLIENT_ID');
        const clientSecret = this.configService.getOrThrow<string>('PAYPAL_CLIENT_SECRET');
        const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

        const response = await fetch(`${this.paypalApiBase}/v1/oauth2/token`, {
            method: 'POST',
            body: 'grant_type=client_credentials',
            headers: {
                Authorization: `Basic ${auth}`,
            },
        });

        const data = await response.json();
        if (!response.ok) {
            console.error('PayPal Auth Error:', data);
            throw new Error('Failed to authenticate with PayPal');
        }
        return data.access_token;
    }

    async createPayPalOrder(amount: number, currency: string = 'USD') {
        const accessToken = await this.generatePayPalAccessToken();
        const value = (amount / 100).toFixed(2); // Convert cents to dollars string

        const response = await fetch(`${this.paypalApiBase}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [
                    {
                        amount: {
                            currency_code: currency,
                            value: value,
                        },
                    },
                ],
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            console.error('PayPal Create Order Error:', data);
            throw new Error('Failed to create PayPal order');
        }
        return data; 
    }

    async capturePayPalOrder(orderId: string) {
        const accessToken = await this.generatePayPalAccessToken();

        const response = await fetch(`${this.paypalApiBase}/v2/checkout/orders/${orderId}/capture`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const data = await response.json();
        if (!response.ok) {
            console.error('PayPal Capture Error:', data);
            throw new BadRequestException('Failed to capture PayPal order');
        }
        return data;
    }
}
