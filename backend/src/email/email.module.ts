import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';

@Global()
@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forFeature([User, Product])
    ],
    controllers: [EmailController],
    providers: [EmailService],
    exports: [EmailService],
})
export class EmailModule { }
