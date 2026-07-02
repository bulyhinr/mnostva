import { Injectable, NotFoundException, Inject, forwardRef, BadRequestException, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Order } from './entities/order.entity';
import { ProductsService } from '../products/products.service';
import { PaymentsService } from '../payments/payments.service';
import { OrderItem } from './entities/order-item.entity';
import Stripe from 'stripe';

import { EmailService } from '../email/email.service';
import { CouponsService } from '../coupons/coupons.service';

@Injectable()
export class OrdersService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(OrdersService.name);
    private schedulerInterval: NodeJS.Timeout | null = null;
    private readonly REMINDER_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours
    constructor(
        @InjectRepository(Order)
        private ordersRepository: Repository<Order>,
        private productsService: ProductsService,
        @Inject(forwardRef(() => PaymentsService))
        private paymentsService: PaymentsService,
        private emailService: EmailService,
        private couponsService: CouponsService,
    ) { }

    async create(orderData: Partial<Order>): Promise<Order> {
        const order = this.ordersRepository.create(orderData);
        return this.ordersRepository.save(order);
    }

    async createOrder(userId: string, itemsData: { productId: string, licenseType?: string }[], couponCode?: string, paymentMethod: string = 'stripe') {
        if (!itemsData || itemsData.length === 0) {
            throw new BadRequestException('No products in order');
        }

        if (paymentMethod !== 'stripe' && paymentMethod !== 'paypal') {
            throw new BadRequestException('Invalid payment method string');
        }

        // 1. Fetch products to get current prices
        const products = await this.productsService.findAllProducts(); // We might want a findByIds method
        const orderItems: OrderItem[] = [];
        let totalAmount = 0;

        for (const itemData of itemsData) {
            const productId = itemData.productId;
            const licenseType = itemData.licenseType || 'standard';
            const product = products.find(p => p.id === productId);
            if (!product) {
                throw new NotFoundException(`Product ${productId} not found`);
            }

            if (!product.isActive) {
                throw new BadRequestException(`Product "${product.title}" is currently unavailable for purchase.`);
            }

            const item = new OrderItem();
            item.product = product;
            item.licenseType = licenseType;

            // Use commercialPrice if standard vs commercial is provided
            let basePrice = (licenseType === 'commercial' && product.commercialPrice) ? product.commercialPrice : product.price;
            let finalPrice = basePrice;
            let discountPercentage = 0;

            if (product.discount && product.discount.isActive) {
                discountPercentage = product.discount.percentage;
                const discountAmount = Math.round(basePrice * (discountPercentage / 100));
                finalPrice = basePrice - discountAmount;
            }

            item.price = finalPrice;
            item.originalPrice = basePrice;
            item.discountPercentage = discountPercentage > 0 ? discountPercentage : null;
            item.quantity = 1;

            orderItems.push(item);
            totalAmount += finalPrice;
        }

        // Process coupon if present
        let couponDiscountAmount = 0;
        let finalCouponCode: string | null = null;
        if (couponCode) {
            try {
                const validation = await this.couponsService.validate(couponCode);
                if (validation.valid) {
                    couponDiscountAmount = Math.round(totalAmount * (validation.discountPercentage / 100));
                    totalAmount -= couponDiscountAmount;
                    finalCouponCode = couponCode.toUpperCase().trim();
                }
            } catch (e) {
                // Ignore invalid coupon or throw error if strict
                throw new BadRequestException(e.message || 'Invalid coupon code');
            }
        }

        // 2. Create Order
        const order = new Order();
        order.user = { id: userId } as any;
        order.items = orderItems;
        order.totalAmount = totalAmount; // This is the final amount to pay
        order.couponCode = finalCouponCode;
        order.couponDiscount = couponDiscountAmount;
        order.status = 'pending';
        order.paymentMethod = paymentMethod;

        if (totalAmount <= 0) {
            order.status = 'paid';
            const savedOrder = await this.ordersRepository.save(order);
            
            if (order.couponCode) {
                 await this.couponsService.incrementUses(order.couponCode);
            }
            
            // Reload to get user email
            const reloadedOrder = await this.findOne(savedOrder.id);
            if (reloadedOrder && reloadedOrder.user && reloadedOrder.user.email) {
                this.emailService.sendOrderConfirmation(reloadedOrder.user.email, savedOrder);
            }
            
            return {
                orderId: savedOrder.id,
                isFree: true,
                status: 'paid'
            };
        }

        const savedOrder = await this.ordersRepository.save(order);

        if (paymentMethod === 'paypal') {
            const paypalOrder = await this.paymentsService.createPayPalOrder(totalAmount);
            savedOrder.paypalOrderId = paypalOrder.id;
            await this.ordersRepository.save(savedOrder);
            return {
                paypalOrderId: paypalOrder.id,
                orderId: savedOrder.id
            };
        } else {
            // 3. Create Payment Intent
            const paymentIntent = await this.paymentsService.createPaymentIntent(totalAmount, 'usd', {
                orderId: savedOrder.id,
                userId,
            });

            // 4. Save Payment Intent ID to Order (for webhook matching)
            savedOrder.stripePaymentIntentId = paymentIntent.id;
            await this.ordersRepository.save(savedOrder);

            return {
                clientSecret: paymentIntent.client_secret,
                orderId: savedOrder.id
            };
        }
    }

    async updateStatus(id: string, status: 'pending' | 'paid' | 'failed' | 'fulfilled' | 'cancelled') {
        const order = await this.findOne(id);
        if (!order) {
            throw new NotFoundException(`Order ${id} not found`);
        }
        const previousStatus = order.status;
        order.status = status;
        const savedOrder = await this.ordersRepository.save(order);

        // Send email confirmation if transitioning to paid
        if (status === 'paid' && previousStatus !== 'paid' && order.user && order.user.email) {
            this.emailService.sendOrderConfirmation(order.user.email, savedOrder);
        }

        return savedOrder;
    }

    async cancelOrder(orderId: string, userId: string): Promise<Order> {
        const order = await this.findOne(orderId);
        if (!order) {
            throw new NotFoundException(`Order ${orderId} not found`);
        }
        if (!order.user || order.user.id !== userId) {
            throw new NotFoundException('Order not found or access denied');
        }
        if (order.status !== 'pending') {
            throw new BadRequestException('Only pending orders can be cancelled');
        }

        order.status = 'cancelled';
        return this.ordersRepository.save(order);
    }

    async findOne(id: string): Promise<Order | null> {
        return this.ordersRepository.findOne({ where: { id }, relations: ['items', 'items.product', 'user'] });
    }

    async findByUser(userId: string): Promise<Order[]> {
        return this.ordersRepository.find({
            where: { user: { id: userId } },
            relations: ['items', 'items.product', 'user'],
            order: { createdAt: 'DESC' }
        });
    }

    async getPaymentDetails(orderId: string, userId: string): Promise<{ clientSecret?: string, paypalOrderId?: string }> {
        const order = await this.findOne(orderId);
        if (!order) throw new NotFoundException('Order not found');

        // Ensure user relation is loaded and matches
        if (!order.user || order.user.id !== userId) {
            throw new NotFoundException('Order not found or access denied');
        }

        if (order.status === 'paid') {
            throw new BadRequestException('Order is already paid');
        }

        if (order.paymentMethod === 'paypal') {
            if (!order.paypalOrderId) {
                throw new Error('PayPal Order ID missing on order');
            }
            return { paypalOrderId: order.paypalOrderId };
        }

        let paymentIntent: Stripe.PaymentIntent;
        try {
            if (!order.stripePaymentIntentId) {
                throw new Error('Payment Intent ID missing on order');
            }
            paymentIntent = await this.paymentsService.retrievePaymentIntent(order.stripePaymentIntentId as string);

            // If the PaymentIntent was canceled on Stripe, we must re-create a new one
            if (paymentIntent.status === 'canceled') {
                throw new Error('Payment Intent was canceled');
            }
        } catch (error) {
            // Re-create Payment Intent if missing, expired, or canceled
            paymentIntent = await this.paymentsService.createPaymentIntent(order.totalAmount, 'usd', {
                orderId: order.id,
                userId,
            });

            // Update database with new stripePaymentIntentId
            order.stripePaymentIntentId = paymentIntent.id;
            await this.ordersRepository.save(order);
        }

        if (!paymentIntent.client_secret) {
            throw new Error('Client secret not returned from Stripe');
        }

        return { clientSecret: paymentIntent.client_secret };
    }

    async verifyPayment(orderId: string, userId: string): Promise<Order> {
        const order = await this.findOne(orderId);
        if (!order) throw new NotFoundException('Order not found');

        if (!order.user || order.user.id !== userId) {
            throw new NotFoundException('Access denied');
        }

        if (order.status === 'paid') return order;

        if (!order.stripePaymentIntentId) return order;

        const paymentIntent = await this.paymentsService.retrievePaymentIntent(order.stripePaymentIntentId);

        if (paymentIntent.status === 'succeeded') {
            order.status = 'paid';

            if (order.couponCode) {
                await this.couponsService.incrementUses(order.couponCode);
            }

            // Extract receipt URL
            if (paymentIntent.latest_charge) {
                const charge = paymentIntent.latest_charge as Stripe.Charge;
                if (charge.receipt_url) {
                    order.receiptUrl = charge.receipt_url;
                }
            }

            const savedOrder = await this.ordersRepository.save(order);

            // Send confirmation email
            this.emailService.sendOrderConfirmation(order.user.email, savedOrder);

            return savedOrder;
        }

        return order;
    }

    async capturePayPalOrder(orderId: string, userId: string): Promise<Order> {
        const order = await this.findOne(orderId);
        if (!order) throw new NotFoundException('Order not found');
        if (!order.user || order.user.id !== userId) throw new NotFoundException('Access denied');
        if (order.status === 'paid') return order;
        if (!order.paypalOrderId) throw new Error('Not a PayPal order');

        const captureResult = await this.paymentsService.capturePayPalOrder(order.paypalOrderId);
        if (captureResult.status === 'COMPLETED') {
            order.status = 'paid';
            if (order.couponCode) {
                await this.couponsService.incrementUses(order.couponCode);
            }
            const savedOrder = await this.ordersRepository.save(order);
            this.emailService.sendOrderConfirmation(order.user.email, savedOrder);
            return savedOrder;
        } else {
            throw new Error(`Payment capture failed, status: ${captureResult.status}`);
        }
    }

    async findAll(page: number = 1, limit: number = 30, month?: string, status?: string): Promise<{ data: Order[], total: number, totalRevenue: number }> {
        const qb = this.ordersRepository.createQueryBuilder('order')
            .leftJoinAndSelect('order.user', 'user')
            .leftJoinAndSelect('order.items', 'items')
            .leftJoinAndSelect('items.product', 'product')
            .orderBy('order.createdAt', 'DESC');

        if (status && status !== 'all') {
            qb.andWhere('order.status = :status', { status });
        }

        if (month) {
            const [year, m] = month.split('-').map(Number);
            const start = new Date(Date.UTC(year, m - 1, 1));
            const end = new Date(Date.UTC(year, m, 1));
            qb.andWhere('order.createdAt >= :start AND order.createdAt < :end', { start, end });
        }

        // Calculate total revenue for paid orders in this month (excluding "test" products)
        const sumQb = this.ordersRepository.createQueryBuilder('order')
            .leftJoinAndSelect('order.items', 'items')
            .leftJoinAndSelect('items.product', 'product')
            .where("order.status = 'paid'");

        if (month) {
            const [year, m] = month.split('-').map(Number);
            const start = new Date(Date.UTC(year, m - 1, 1));
            const end = new Date(Date.UTC(year, m, 1));
            sumQb.andWhere('order.createdAt >= :start AND order.createdAt < :end', { start, end });
        }

        const allFilteredPaidOrders = await sumQb.getMany();
        let totalRevenueCents = 0;
        for (const order of allFilteredPaidOrders) {
            let orderRealItemsTotal = 0;
            let orderAllItemsTotal = 0;

            for (const item of order.items) {
                const itemCost = item.price * item.quantity;
                orderAllItemsTotal += itemCost;
                
                const title = item.product?.title || '';
                if (title.toLowerCase() !== 'test') {
                    orderRealItemsTotal += itemCost;
                }
            }

            if (orderAllItemsTotal > 0) {
                // Apply proportional revenue share from order.totalAmount (which has coupon discount deducted)
                const proportionalShare = (orderRealItemsTotal / orderAllItemsTotal) * order.totalAmount;
                totalRevenueCents += Math.round(proportionalShare);
            }
        }

        qb.skip((page - 1) * limit);
        qb.take(limit);

        const [data, total] = await qb.getManyAndCount();
        return { data, total, totalRevenue: totalRevenueCents / 100 };
    }

    onModuleInit() {
        this.logger.log('Initializing Payment Reminder Scheduler...');
        // Runs every 1 minute (60,000 ms)
        this.schedulerInterval = setInterval(async () => {
            try {
                await this.checkAndSendPaymentReminders();
            } catch (err) {
                this.logger.error(`Error in Payment Reminder Scheduler: ${err.message}`);
            }
        }, 60000);
    }

    onModuleDestroy() {
        if (this.schedulerInterval) {
            clearInterval(this.schedulerInterval);
            this.logger.log('Payment Reminder Scheduler stopped.');
        }
    }

    async checkAndSendPaymentReminders() {
        const thresholdDate = new Date(Date.now() - this.REMINDER_THRESHOLD_MS);

        // Find orders in status 'pending' that haven't had reminder sent
        const pendingOrders = await this.ordersRepository.find({
            where: {
                status: 'pending',
                paymentReminderSent: false,
            },
            relations: ['user', 'items', 'items.product'],
        });

        const ordersToRemind = pendingOrders.filter(order => order.createdAt <= thresholdDate);

        if (ordersToRemind.length === 0) return;

        this.logger.log(`Found ${ordersToRemind.length} pending orders eligible for payment reminders.`);

        for (const order of ordersToRemind) {
            try {
                if (order.user && order.user.email) {
                    await this.emailService.sendPaymentReminderEmail(
                        order.user.email,
                        order.user.name || 'Creative',
                        order
                    );
                    
                    // Mark as sent
                    order.paymentReminderSent = true;
                    await this.ordersRepository.save(order);
                    this.logger.log(`Marked order ${order.id} as reminder sent.`);
                }
            } catch (err) {
                this.logger.error(`Failed to send reminder for order ${order.id}: ${err.message}`);
            }
        }
    }
}
