import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { ConfigModule } from '@nestjs/config';
import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from '../products/products.module';
import { DownloadsModule } from '../downloads/downloads.module';

@Module({
  imports: [ConfigModule, OrdersModule, ProductsModule, DownloadsModule],
  providers: [StorageService],
  controllers: [StorageController],
  exports: [StorageService]
})
export class StorageModule { }
