import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { ProductsService } from '../products/products.service';
import { PaymentsService } from '../payments/payments.service';
import { NotFoundException } from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { OrderItem } from './entities/order-item.entity';
import { CouponsService } from '../coupons/coupons.service';

describe('OrdersService', () => {
    let service: OrdersService;
    let ordersRepository;
    let productsService;
    let paymentsService;

    const mockOrder = {
        id: 'order-1',
        user: { id: 'user-1' },
        status: 'pending',
        totalAmount: 1000,
        items: [],
        stripePaymentIntentId: 'pi_123',
    };

    const mockProduct = {
        id: 'prod-1',
        price: 1000,
        title: 'Test Product',
    };

    const mockPaymentIntent = {
        id: 'pi_123',
        client_secret: 'secret_123',
        status: 'succeeded',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrdersService,
                {
                    provide: getRepositoryToken(Order),
                    useValue: {
                        create: jest.fn().mockImplementation((dto) => ({ ...mockOrder, ...dto, id: 'order-1' })),
                        save: jest.fn().mockImplementation((order) => Promise.resolve({ ...mockOrder, ...order, id: 'order-1' })),
                        findOne: jest.fn().mockImplementation(() => Promise.resolve({ ...mockOrder })),
                        find: jest.fn().mockResolvedValue([{ ...mockOrder }]),
                    },
                },
                {
                    provide: ProductsService,
                    useValue: {
                        findAllProducts: jest.fn().mockResolvedValue([mockProduct]),
                    },
                },
                {
                    provide: PaymentsService,
                    useValue: {
                        createPaymentIntent: jest.fn().mockResolvedValue(mockPaymentIntent),
                        retrievePaymentIntent: jest.fn().mockResolvedValue(mockPaymentIntent),
                    },
                },
                {
                    provide: EmailService,
                    useValue: {
                        sendOrderConfirmation: jest.fn(),
                    },
                },
                {
                    provide: CouponsService,
                    useValue: {
                        validate: jest.fn().mockResolvedValue({ valid: true, discountPercentage: 10 }),
                        incrementUses: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<OrdersService>(OrdersService);
        ordersRepository = module.get(getRepositoryToken(Order));
        productsService = module.get(ProductsService);
        paymentsService = module.get(PaymentsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should call create and save on repository', async () => {
            await service.create({ status: 'pending' });
            expect(ordersRepository.create).toHaveBeenCalledWith({ status: 'pending' });
            expect(ordersRepository.save).toHaveBeenCalled();
        });
    });

    describe('createOrder', () => {
        it('should create an order successfully with discount applied', async () => {
            const mockProductWithDiscount = {
                id: 'prod-2',
                price: 1000,
                title: 'Discounted',
                discount: { isActive: true, percentage: 10 }
            };
            productsService.findAllProducts.mockResolvedValue([mockProductWithDiscount]);

            const result = await service.createOrder('user-1', ['prod-2']);

            expect(productsService.findAllProducts).toHaveBeenCalled();
            expect(ordersRepository.save).toHaveBeenCalled();
            expect(paymentsService.createPaymentIntent).toHaveBeenCalled();
            expect(result).toEqual({
                clientSecret: 'secret_123',
                orderId: 'order-1',
            });
        });

        it('should create an order successfully with default product', async () => {
            productsService.findAllProducts.mockResolvedValue([mockProduct]);
            const result = await service.createOrder('user-1', ['prod-1']);

            expect(productsService.findAllProducts).toHaveBeenCalled();
            expect(ordersRepository.save).toHaveBeenCalled();
            expect(paymentsService.createPaymentIntent).toHaveBeenCalled();
            expect(result).toEqual({
                clientSecret: 'secret_123',
                orderId: 'order-1',
            });
        });

        it('should throw error if no product ids provided', async () => {
            await expect(service.createOrder('user-1', [])).rejects.toThrow('No products in order');
        });

        it('should throw NotFoundException if product not found', async () => {
            await expect(service.createOrder('user-1', ['invalid-prod'])).rejects.toThrow(NotFoundException);
        });
    });

    describe('verifyPayment', () => {
        it('should update status to paid if payment succeeded', async () => {
            jest.spyOn(service, 'findOne').mockResolvedValue({ ...mockOrder } as any);

            const result = await service.verifyPayment('order-1', 'user-1');

            expect(paymentsService.retrievePaymentIntent).toHaveBeenCalledWith('pi_123');
            expect(ordersRepository.save).toHaveBeenCalledWith(expect.objectContaining({ status: 'paid' }));
            expect(result.status).toBe('paid');
        });

        it('should not update if payment not succeeded', async () => {
            const pendingPaymentIntent = { ...mockPaymentIntent, status: 'requires_payment_method' };
            paymentsService.retrievePaymentIntent.mockResolvedValue(pendingPaymentIntent);
            jest.spyOn(service, 'findOne').mockResolvedValue({ ...mockOrder, status: 'pending' } as any);

            const result = await service.verifyPayment('order-1', 'user-1');

            expect(result.status).toBe('pending');
        });

        it('should return order if already paid', async () => {
            jest.spyOn(service, 'findOne').mockResolvedValue({ ...mockOrder, status: 'paid' } as any);

            const result = await service.verifyPayment('order-1', 'user-1');

            expect(paymentsService.retrievePaymentIntent).not.toHaveBeenCalled();
            expect(result.status).toBe('paid');
        });
        it('should handle verifyPayment when order has no stripePaymentIntentId', async () => {
            jest.spyOn(service, 'findOne').mockResolvedValue({ ...mockOrder, stripePaymentIntentId: null } as any);

            const result = await service.verifyPayment('order-1', 'user-1');
            expect(result.status).toBe('pending');
        });

        it('should handle verifyPayment mapping receiptUrl and sending email on success', async () => {
            const piWithCharge = {
                ...mockPaymentIntent,
                latest_charge: { receipt_url: 'http://receipt.com' }
            };
            paymentsService.retrievePaymentIntent.mockResolvedValue(piWithCharge);
            jest.spyOn(service, 'findOne').mockResolvedValue({ ...mockOrder, user: { id: 'user-1', email: 'a@b.c' } } as any);

            const result = await service.verifyPayment('order-1', 'user-1');

            expect(ordersRepository.save).toHaveBeenCalledWith(expect.objectContaining({ receiptUrl: 'http://receipt.com', status: 'paid' }));
            // @ts-ignore
            expect(service['emailService'].sendOrderConfirmation).toHaveBeenCalled();
            expect(result.status).toBe('paid');
        });

        it('should throw NotFoundException if order not found', async () => {
            jest.spyOn(service, 'findOne').mockResolvedValue(null);
            await expect(service.verifyPayment('order-1', 'user-1')).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException if user does not match', async () => {
            jest.spyOn(service, 'findOne').mockResolvedValue({ ...mockOrder } as any);
            await expect(service.verifyPayment('order-1', 'user-2')).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateStatus', () => {
        it('should update and save order status', async () => {
            jest.spyOn(service, 'findOne').mockResolvedValue({ ...mockOrder } as any);

            await service.updateStatus('order-1', 'fulfilled');
            expect(ordersRepository.save).toHaveBeenCalledWith(expect.objectContaining({ status: 'fulfilled' }));
        });

        it('should throw NotFoundException if order not found', async () => {
            jest.spyOn(service, 'findOne').mockResolvedValue(null);

            await expect(service.updateStatus('order-1', 'fulfilled')).rejects.toThrow(NotFoundException);
        });
    });

    describe('cancelOrder', () => {
        it('should cancel pending order', async () => {
            jest.spyOn(service, 'findOne').mockResolvedValue({ ...mockOrder } as any);

            const result = await service.cancelOrder('order-1', 'user-1');

            expect(ordersRepository.save).toHaveBeenCalledWith(expect.objectContaining({ status: 'cancelled' }));
        });

        it('should throw error if order not pending', async () => {
            jest.spyOn(service, 'findOne').mockResolvedValue({ ...mockOrder, status: 'paid' } as any);

            await expect(service.cancelOrder('order-1', 'user-1')).rejects.toThrow('Only pending orders can be cancelled');
        });

        it('should throw NotFoundException if order not found', async () => {
            jest.spyOn(service, 'findOne').mockResolvedValue(null);
            await expect(service.cancelOrder('order-1', 'user-1')).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException if user mismatch', async () => {
            jest.spyOn(service, 'findOne').mockResolvedValue({ ...mockOrder } as any);
            await expect(service.cancelOrder('order-1', 'user-2')).rejects.toThrow(NotFoundException);
        });
    });

    describe('findByUser', () => {
        it('should find orders by user', async () => {
            expect(await service.findByUser('user-1')).toEqual([mockOrder]);
            expect(ordersRepository.find).toHaveBeenCalledWith(expect.objectContaining({
                where: { user: { id: 'user-1' } }
            }));
        });
    });

    describe('getPaymentDetails', () => {
        it('should return client secret', async () => {
            jest.spyOn(service, 'findOne').mockResolvedValue({ ...mockOrder } as any);
            const result = await service.getPaymentDetails('order-1', 'user-1');
            expect(result).toEqual({ clientSecret: 'secret_123' });
        });

        it('should throw if order not found', async () => {
            jest.spyOn(service, 'findOne').mockResolvedValue(null);
            await expect(service.getPaymentDetails('order-1', 'user-1')).rejects.toThrow(NotFoundException);
        });

        it('should throw if user mismatch', async () => {
            jest.spyOn(service, 'findOne').mockResolvedValue({ ...mockOrder } as any);
            await expect(service.getPaymentDetails('order-1', 'user-2')).rejects.toThrow('Order not found or access denied');
        });

        it('should throw if order is already paid', async () => {
            jest.spyOn(service, 'findOne').mockResolvedValue({ ...mockOrder, status: 'paid' } as any);
            await expect(service.getPaymentDetails('order-1', 'user-1')).rejects.toThrow('Order is already paid');
        });

        it('should throw if missing payment intent ID', async () => {
            jest.spyOn(service, 'findOne').mockResolvedValue({ ...mockOrder, stripePaymentIntentId: null } as any);
            await expect(service.getPaymentDetails('order-1', 'user-1')).rejects.toThrow('Payment Intent ID missing on order');
        });

        it('should throw if client secret missing from Stripe', async () => {
            jest.spyOn(service, 'findOne').mockResolvedValue({ ...mockOrder } as any);
            paymentsService.retrievePaymentIntent.mockResolvedValue({ ...mockPaymentIntent, client_secret: null });
            await expect(service.getPaymentDetails('order-1', 'user-1')).rejects.toThrow('Client secret not returned from Stripe');
        });
    });
});
