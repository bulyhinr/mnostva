import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { NotFoundException } from '@nestjs/common';

describe('OrdersController', () => {
    let controller: OrdersController;
    let service: OrdersService;

    const mockOrder = {
        id: 'order-1',
        totalAmount: 1000,
        status: 'pending',
    };

    const mockOrdersService = {
        createOrder: jest.fn().mockResolvedValue({ id: 'order-1', clientSecret: 'secret_123' }),
        create: jest.fn().mockResolvedValue(mockOrder),
        findByUser: jest.fn().mockResolvedValue([mockOrder]),
        getPaymentDetails: jest.fn().mockResolvedValue({ clientSecret: 'secret_123' }),
        cancelOrder: jest.fn().mockResolvedValue({ ...mockOrder, status: 'cancelled' }),
        verifyPayment: jest.fn().mockResolvedValue({ ...mockOrder, status: 'paid' }),
        capturePayPalOrder: jest.fn().mockResolvedValue({ ...mockOrder, status: 'paid' }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [OrdersController],
            providers: [
                {
                    provide: OrdersService,
                    useValue: mockOrdersService,
                },
            ],
        }).compile();

        controller = module.get<OrdersController>(OrdersController);
        service = module.get<OrdersService>(OrdersService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('createCheckoutSession', () => {
        it('should create an order', async () => {
            const result = await controller.createCheckoutSession({ user: { userId: 'user-1' } }, { items: [{ productId: 'prod-1' }], paymentMethod: 'stripe' });

            expect(service.createOrder).toHaveBeenCalledWith('user-1', [{ productId: 'prod-1' }], undefined, 'stripe');
            expect(result).toEqual({ id: 'order-1', clientSecret: 'secret_123' });
        });
    });

    describe('create', () => {
        it('should transform and create order', async () => {
            const req = { user: { userId: 'user-1' } };
            const orderData = {
                items: [{ productId: 'p1', quantity: 2, price: 10.5 }],
                total: 21
            };
            const result = await controller.create(req, orderData);

            expect(service.create).toHaveBeenCalledWith(expect.objectContaining({
                user: { id: 'user-1' },
                items: [{ product: { id: 'p1' }, price: 1050, quantity: 2, licenseType: 'standard' }],
                totalAmount: 2100,
                status: 'paid'
            }));
            expect(result).toEqual(mockOrder);
        });

        it('should use orderData userId if req.user is absent', async () => {
            const req = { user: null };
            const orderData = {
                userId: 'user-2',
                items: [{ productId: 'p1', quantity: 2, price: 10.5 }],
                total: 21
            };
            await controller.create(req, orderData);

            expect(service.create).toHaveBeenCalledWith(expect.objectContaining({
                user: { id: 'user-2' }
            }));
        });

        it('should handle generic error', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            (service.create as jest.Mock).mockRejectedValueOnce(new Error('Gen Error'));

            const req = { user: { userId: 'user-1' } };
            const orderData = { items: [], total: 0 };

            await expect(controller.create(req, orderData)).rejects.toThrow('Gen Error');
            consoleSpy.mockRestore();
        });

        it('should handle user FK violation', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            const err = new Error('Viol');
            (err as any).code = '23503';
            (err as any).detail = 'user';
            (service.create as jest.Mock).mockRejectedValueOnce(err);

            await expect(controller.create({ user: { userId: 'u1' } }, { items: [], total: 0 })).rejects.toThrow('User not found (Foreign Key Violation). ID: u1');
            consoleSpy.mockRestore();
        });

        it('should handle product FK violation', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            const err = new Error('Viol');
            (err as any).code = '23503';
            (err as any).detail = 'product';
            (service.create as jest.Mock).mockRejectedValueOnce(err);

            await expect(controller.create({ user: { userId: 'u1' } }, { items: [], total: 0 })).rejects.toThrow('Product not found (Foreign Key Violation). Check cart items.');
            consoleSpy.mockRestore();
        });
    });

    describe('findMyOrders', () => {
        it('should list user orders', async () => {
            const result = await controller.findMyOrders({ user: { userId: 'user-1' } });
            expect(service.findByUser).toHaveBeenCalledWith('user-1');
            expect(result).toEqual([mockOrder]);
        });
    });

    describe('getPaymentDetails', () => {
        it('should fetch payment details', async () => {
            const result = await controller.getPaymentDetails('order-1', { user: { userId: 'user-1' } });
            expect(service.getPaymentDetails).toHaveBeenCalledWith('order-1', 'user-1');
            expect(result).toEqual({ clientSecret: 'secret_123' });
        });
    });

    describe('cancelOrder', () => {
        it('should cancel order', async () => {
            const result = await controller.cancelOrder('order-1', { user: { userId: 'user-1' } });
            expect(service.cancelOrder).toHaveBeenCalledWith('order-1', 'user-1');
            expect(result.status).toEqual('cancelled');
        });
    });

    describe('verifyOrder', () => {
        it('should verify payment', async () => {
            const result = await controller.verifyOrder('order-1', { user: { userId: 'user-1' } });
            expect(service.verifyPayment).toHaveBeenCalledWith('order-1', 'user-1');
            expect(result.status).toEqual('paid');
        });
    });

    describe('capturePayPalOrder', () => {
        it('should capture paypal payment', async () => {
            const result = await controller.capturePayPalOrder('order-1', { user: { userId: 'user-1' } });
            expect(service.capturePayPalOrder).toHaveBeenCalledWith('order-1', 'user-1');
            expect(result.status).toEqual('paid');
        });
    });
});
