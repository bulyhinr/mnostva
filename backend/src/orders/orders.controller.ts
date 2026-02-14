import { Controller, Post, Body, UseGuards, Request, Get, InternalServerErrorException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    async create(@Request() req, @Body() orderData: { userId?: string, items: { productId: string, quantity: number, price: number }[], total: number }) {
        const userId = req.user?.userId || orderData.userId;

        // Transform items for TypeORM (relation by ID) and convert prices to cents
        const items = orderData.items.map(item => ({
            product: { id: item.productId } as any,
            price: Math.round(item.price * 100), // Convert to cents
            quantity: item.quantity,
        }));

        try {
            return await this.ordersService.create({
                user: { id: userId } as any,
                items: items as any,
                totalAmount: Math.round(orderData.total * 100), // Frontend total in dollars -> cents
                status: 'paid',
            });
        } catch (error: any) {
            console.error('Order Creation Failed:', error);

            // Extract meaningful message from TypeORM error
            let message = error.message;
            if (error.code === '23503') { // Foreign key violation
                if (error.detail && error.detail.includes('user')) {
                    message = `User not found (Foreign Key Violation). ID: ${userId}`;
                } else if (error.detail && error.detail.includes('product')) {
                    message = `Product not found (Foreign Key Violation). Check cart items.`;
                }
            }

            throw new InternalServerErrorException(message || 'Failed to create order');
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('my-orders')
    async findMyOrders(@Request() req) {
        return this.ordersService.findByUser(req.user.userId);
    }
}
