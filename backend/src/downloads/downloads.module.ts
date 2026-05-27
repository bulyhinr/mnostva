import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DownloadsService } from './downloads.service';
import { DownloadsController } from './downloads.controller';
import { DownloadLog } from './entities/download-log.entity';
import { ProductsModule } from '../products/products.module';
import { OrdersModule } from '../orders/orders.module';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([DownloadLog]),
        ProductsModule,
        OrdersModule,
        UsersModule,
    ],
    controllers: [DownloadsController],
    providers: [DownloadsService],
    exports: [DownloadsService],
})
export class DownloadsModule { }
