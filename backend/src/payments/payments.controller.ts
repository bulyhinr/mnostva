import {
    Controller,
    Post,
    Headers,
    Req,
    BadRequestException,
    Inject,
    forwardRef
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { PaymentsService } from './payments.service';
import { ConfigService } from '@nestjs/config';
import { OrdersService } from '../orders/orders.service';
import Stripe from 'stripe';

@Controller('payments')
export class PaymentsController {
    constructor(
        private readonly paymentsService: PaymentsService,
        private readonly configService: ConfigService,
        @Inject(forwardRef(() => OrdersService))
        private readonly ordersService: OrdersService,
    ) { }

    @Post('webhook')
    async handleWebhook(
        @Headers('stripe-signature') signature: string,
        @Req() req: RawBodyRequest<Request>,
    ) {
        if (!signature) {
            throw new BadRequestException('Missing stripe-signature header');
        }

        if (!req.rawBody) {
            throw new BadRequestException('Missing raw body');
        }

        const webhookSecret = this.configService.getOrThrow<string>('STRIPE_WEBHOOK_SECRET');
        let event: Stripe.Event;

        try {
            event = this.paymentsService.constructEvent(
                req.rawBody,
                signature,
                webhookSecret,
            );
        } catch (err) {
            console.error(`Webhook Error: ${err.message}`);
            throw new BadRequestException(`Webhook Error: ${err.message}`);
        }

        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            // Stripe stores metadata as key-value strings. keys are whatever we set.
            // We set 'orderId' in OrdersService.
            const orderId = paymentIntent.metadata?.orderId;

            if (orderId) {
                console.log(`Payment confirmed for Order: ${orderId}`);
                await this.ordersService.updateStatus(orderId, 'paid');
            } else {
                console.warn('PaymentIntent succeeded but no orderId in metadata', paymentIntent.id);
            }
        }

        return { received: true };
    }
}
