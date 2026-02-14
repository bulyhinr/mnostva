import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { DownloadsModule } from './downloads/downloads.module';
import { PaymentsModule } from './payments/payments.module';
import { User } from './users/entities/user.entity';
import { Product } from './products/entities/product.entity';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { DownloadLog } from './downloads/entities/download-log.entity';

import { DiscountsModule } from './discounts/discounts.module';
import { Discount } from './discounts/entities/discount.entity';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate Limiting
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        entities: [User, Product, Order, OrderItem, DownloadLog, Discount],
        synchronize: configService.get('NODE_ENV') !== 'production', // Auto-sync only in dev
        logging: configService.get('NODE_ENV') !== 'production',
      }),
    }),

    // Feature Modules
    AuthModule,
    UsersModule,
    ProductsModule,
    DiscountsModule,
    OrdersModule,
    DownloadsModule,
    PaymentsModule,
    StorageModule,
  ],
})
export class AppModule { }
