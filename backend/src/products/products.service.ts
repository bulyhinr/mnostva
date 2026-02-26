import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';
import { OrderItem } from '../orders/entities/order-item.entity';
import { DownloadLog } from '../downloads/entities/download-log.entity';

@Injectable()
export class ProductsService implements OnModuleInit {
    constructor(
        @InjectRepository(Product)
        private productsRepository: Repository<Product>,
    ) { }

    async onModuleInit() {
        try {
            // Ensure product_id is nullable to support SET NULL logic on delete
            await this.productsRepository.query(
                `ALTER TABLE "order_items" ALTER COLUMN "product_id" DROP NOT NULL`
            );
            await this.productsRepository.query(
                `ALTER TABLE "download_logs" ALTER COLUMN "product_id" DROP NOT NULL`
            );
            console.log('Schema patched: order_items.product_id and download_logs.product_id are now nullable');
        } catch (e) {
            // Ignore if column doesn't exist or already nullable
            console.warn('Schema patch skipped:', (e as Error).message);
        }
    }

    async create(createProductDto: CreateProductDto): Promise<Product> {
        const { discountId, ...rest } = createProductDto;
        const product = this.productsRepository.create({
            ...rest,
            discount: discountId ? { id: discountId } : null as any,
        });
        return this.productsRepository.save(product);
    }

    async findAll(options: {
        page: number;
        limit: number;
        category?: string;
        sortBy?: string;
        polyCount?: string;
        rigged?: string;
        animated?: string;
        textures?: string;
    }): Promise<[Product[], number]> {
        const qb = this.productsRepository.createQueryBuilder('product')
            .leftJoinAndSelect('product.discount', 'discount');

        if (options.category && options.category !== 'All') {
            qb.andWhere('product.category = :category', { category: options.category });
        }

        if (options.polyCount && options.polyCount !== 'All') {
            qb.andWhere(`product.technicalSpecs->>'polyCount' = :polyCount`, { polyCount: options.polyCount });
        }

        if (options.rigged && options.rigged !== 'All') {
            qb.andWhere(`product.technicalSpecs->>'rigged' = :rigged`, { rigged: options.rigged });
        }

        if (options.animated && options.animated !== 'All') {
            qb.andWhere(`product.technicalSpecs->>'animated' = :animated`, { animated: options.animated });
        }

        if (options.textures && options.textures !== 'All') {
            qb.andWhere(`product.technicalSpecs->>'textures' = :textures`, { textures: options.textures });
        }

        // Handle sorting
        if (options.sortBy === 'newest') {
            qb.orderBy('product.createdAt', 'DESC');
        } else if (options.sortBy === 'price-asc') {
            qb.orderBy('product.price', 'ASC');
        } else if (options.sortBy === 'price-desc') {
            qb.orderBy('product.price', 'DESC');
        } else if (options.sortBy) {
            qb.orderBy(`product.${options.sortBy}`, 'DESC');
        } else {
            qb.orderBy('product.createdAt', 'DESC');
        }

        qb.skip((options.page - 1) * options.limit);
        qb.take(options.limit);

        return qb.getManyAndCount();
    }

    async findAllProducts(): Promise<Product[]> {
        return this.productsRepository.find({ order: { createdAt: 'DESC' } });
    }

    async findOne(id: string): Promise<Product | null> {
        return this.productsRepository.findOne({ where: { id } });
    }

    async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
        const { discountId, ...rest } = updateProductDto;
        const updateData: any = { ...rest };
        if (discountId !== undefined) {
            updateData.discount = discountId ? { id: discountId } : null as any;
        }
        await this.productsRepository.update(id, updateData);

        const updatedProduct = await this.findOne(id);
        if (!updatedProduct) {
            throw new Error('Product not found');
        }
        return updatedProduct;
    }

    async remove(id: string): Promise<void> {
        try {
            const product = await this.findOne(id);
            if (!product) {
                // If product doesn't exist, we can satisfy the request (idempotent) or throw 404.
                // Ideally throw NotFoundException, but here we just return to avoid 500 if user retries.
                console.warn(`Product ${id} not found, skipping delete.`);
                return;
            }

            await this.productsRepository.manager.transaction(async transactionalEntityManager => {
                // Use raw SQL for absolute certainty about table/column names and to bypass any ORM alias issues
                await transactionalEntityManager.query(
                    `UPDATE "order_items" SET "product_id" = NULL WHERE "product_id" = $1`,
                    [id]
                );

                await transactionalEntityManager.query(
                    `UPDATE "download_logs" SET "product_id" = NULL WHERE "product_id" = $1`,
                    [id]
                );

                // Now delete the product
                await transactionalEntityManager.delete(Product, id);
            });
        } catch (error) {
            console.error(`Failed to delete product ${id}:`, error);
            throw error;
        }
    }
}
