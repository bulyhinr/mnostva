import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WishlistItem } from './entities/wishlist-item.entity';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class WishlistService {
    constructor(
        @InjectRepository(WishlistItem)
        private wishlistRepository: Repository<WishlistItem>,
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
    ) { }
    
    async onModuleInit() {
        try {
            await this.wishlistRepository.query(`
                CREATE TABLE IF NOT EXISTS "wishlist_items" (
                    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
                    "addedAt" TIMESTAMP NOT NULL DEFAULT now(),
                    "userId" uuid,
                    "productId" uuid,
                    CONSTRAINT "PK_wishlist_items_id" PRIMARY KEY ("id"),
                    CONSTRAINT "FK_wishlist_items_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
                    CONSTRAINT "FK_wishlist_items_product" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE
                )
            `);
        } catch (e) {
            console.warn('Failed to ensure wishlist table:', (e as Error).message);
        }
    }

    async toggle(userId: string, productId: string): Promise<{ status: 'added' | 'removed' }> {
        const product = await this.productRepository.findOneBy({ id: productId });
        if (!product) {
            throw new NotFoundException(`Product ${productId} not found`);
        }

        const existingItem = await this.wishlistRepository.findOne({
            where: {
                user: { id: userId },
                product: { id: productId },
            },
        });

        if (existingItem) {
            await this.wishlistRepository.remove(existingItem);
            return { status: 'removed' };
        } else {
            const newItem = this.wishlistRepository.create({
                user: { id: userId } as User,
                product: { id: productId } as Product,
            });
            await this.wishlistRepository.save(newItem);
            return { status: 'added' };
        }
    }

    async getWishlist(userId: string): Promise<WishlistItem[]> {
        return this.wishlistRepository.find({
            where: { user: { id: userId } },
            relations: ['product'],
            order: { addedAt: 'DESC' },
        });
    }

    async checkStatus(userId: string, productId: string): Promise<boolean> {
        const count = await this.wishlistRepository.count({
            where: {
                user: { id: userId },
                product: { id: productId }
            }
        });
        return count > 0;
    }
}
