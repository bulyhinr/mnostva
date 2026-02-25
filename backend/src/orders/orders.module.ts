import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { ProductsModule } from '../products/products.module';
import { PaymentsModule } from '../payments/payments.module';
import { UsersModule } from '../users/users.module';
import { CouponsModule } from '../coupons/coupons.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Order, OrderItem]),
        ProductsModule,
        UsersModule,
        CouponsModule,
        forwardRef(() => PaymentsModule),
    ],
    controllers: [OrdersController],
    providers: [OrdersService],
    exports: [OrdersService],
})
export class OrdersModule { }
