import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { ConfigService } from '@nestjs/config';

// Mock Stripe class
const mStripe = {
    paymentIntents: {
        create: jest.fn(),
        retrieve: jest.fn(),
    },
    webhooks: {
        constructEvent: jest.fn(),
    },
};

jest.mock('stripe', () => {
    return jest.fn(() => mStripe);
});

describe('PaymentsService', () => {
    let service: PaymentsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PaymentsService,
                {
                    provide: ConfigService,
                    useValue: {
                        getOrThrow: jest.fn().mockReturnValue('fake_key'),
                    },
                },
            ],
        }).compile();

        service = module.get<PaymentsService>(PaymentsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createPaymentIntent', () => {
        it('should create payment intent', async () => {
            mStripe.paymentIntents.create.mockResolvedValue({ id: 'pi_123' });

            const result = await service.createPaymentIntent(1000, 'usd', { orderId: '123' });

            expect(mStripe.paymentIntents.create).toHaveBeenCalledWith({
                amount: 1000,
                currency: 'usd',
                metadata: { orderId: '123' },
            });
            expect(result).toEqual({ id: 'pi_123' });
        });
    });

    describe('constructEvent', () => {
        it('should construct event', () => {
            const mockEvent = { type: 'payment_intent.succeeded' };
            mStripe.webhooks.constructEvent.mockReturnValue(mockEvent);

            const result = service.constructEvent('payload', 'sig', 'secret');

            expect(mStripe.webhooks.constructEvent).toHaveBeenCalledWith('payload', 'sig', 'secret');
            expect(result).toEqual(mockEvent);
        });

        it('should throw error on failure', () => {
            jest.spyOn(console, 'error').mockImplementation(() => { });
            mStripe.webhooks.constructEvent.mockImplementation(() => {
                throw new Error('Invalid signature');
            });

            expect(() => service.constructEvent('payload', 'sig', 'secret')).toThrow('Webhook Error: Invalid signature');
            (console.error as jest.Mock).mockRestore();
        });
    });

    describe('retrievePaymentIntent', () => {
        it('should retrieve payment intent', async () => {
            mStripe.paymentIntents.retrieve.mockResolvedValue({ id: 'pi_123' });

            const result = await service.retrievePaymentIntent('pi_123');

            expect(mStripe.paymentIntents.retrieve).toHaveBeenCalledWith('pi_123', {
                expand: ['latest_charge']
            });
            expect(result).toEqual({ id: 'pi_123' });
        });
    });
});
