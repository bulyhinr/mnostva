import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { ConfigService } from '@nestjs/config';
import { OrdersService } from '../orders/orders.service';
import { BadRequestException } from '@nestjs/common';

describe('PaymentsController', () => {
    let controller: PaymentsController;
    let paymentsService;
    let configService;
    let ordersService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PaymentsController],
            providers: [
                {
                    provide: PaymentsService,
                    useValue: {
                        constructEvent: jest.fn(),
                    },
                },
                {
                    provide: ConfigService,
                    useValue: {
                        getOrThrow: jest.fn().mockReturnValue('webhook_secret'),
                    },
                },
                {
                    provide: OrdersService,
                    useValue: {
                        updateStatus: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<PaymentsController>(PaymentsController);
        paymentsService = module.get(PaymentsService);
        configService = module.get(ConfigService);
        ordersService = module.get(OrdersService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('handleWebhook', () => {
        it('should handle payment_intent.succeeded', async () => {
            const rawBody = Buffer.from('payload');
            const req = { rawBody } as any;
            const event = {
                type: 'payment_intent.succeeded',
                data: {
                    object: {
                        metadata: { orderId: 'order-1' },
                    },
                },
            };

            paymentsService.constructEvent.mockReturnValue(event);

            const result = await controller.handleWebhook('sig', req);

            expect(paymentsService.constructEvent).toHaveBeenCalledWith(rawBody, 'sig', 'webhook_secret');
            expect(ordersService.updateStatus).toHaveBeenCalledWith('order-1', 'paid');
            expect(result).toEqual({ received: true });
        });

        it('should throw BadRequestException if constructEvent fails', async () => {
            const rawBody = Buffer.from('payload');
            const req = { rawBody } as any;
            paymentsService.constructEvent.mockImplementation(() => {
                throw new Error('Invalid signature');
            });

            await expect(controller.handleWebhook('sig', req)).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException if signature missing', async () => {
            await expect(controller.handleWebhook('', {} as any)).rejects.toThrow(BadRequestException);
        });
    });
});
