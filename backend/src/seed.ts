// Polyfill for Node.js 18
if (!global.crypto) {
    // @ts-ignore
    global.crypto = require('crypto');
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ProductsService } from './products/products.service';
import { UsersService } from './users/users.service';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const productsService = app.get(ProductsService);
    const usersService = app.get(UsersService);

    console.log('--- Seeding Database ---');

    // 1. Create Admin User
    const adminEmail = 'admin@mnostva.art';
    const existingAdmin = await usersService.findByEmail(adminEmail);

    if (!existingAdmin) {
        const password = 'admin123';
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        const admin = await usersService.create({
            email: adminEmail,
            name: 'Admin User',
            passwordHash,
            isAdmin: true,
        });
        console.log('✅ Created admin user:', admin.email);
    } else {
        console.log('ℹ️ Admin user already exists');
    }

    // 2. Create Test Product
    const testProduct = await productsService.create({
        title: 'Cyberpunk Katana Model',
        description: 'High-quality 3D model of a futuristic katana.',
        price: 2999, // $29.99
        fileKey: 'products/katana-v1.zip',
        previewImageKey: 'previews/katana.jpg',
        category: 'Weapons',
    } as any);

    console.log('✅ Created test product:', testProduct.title);

    console.log('--- Seeding Completed ---');
    await app.close();
}
bootstrap();
