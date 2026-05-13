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
            // Use a safer check for table existence before patching
            const hasOrderItems = await this.productsRepository.query(
                `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'order_items')`
            );
            if (hasOrderItems[0].exists) {
                await this.productsRepository.query(
                    `ALTER TABLE "order_items" ALTER COLUMN "product_id" DROP NOT NULL`
                );
            }

            const hasDownloadLogs = await this.productsRepository.query(
                `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'download_logs')`
            );
            if (hasDownloadLogs[0].exists) {
                await this.productsRepository.query(
                    `ALTER TABLE "download_logs" ALTER COLUMN "product_id" DROP NOT NULL`
                );
            }
            console.log('Schema patches checked/applied safely.');
        } catch (e) {
            // Ignore if column doesn't exist or already nullable
            console.warn('Schema patch skipped:', (e as Error).message);
        }
    }

    private sanitizeProduct(product: Product): Product {
        if (!product) return product;

        const ensureArray = (data: any): string[] => {
            if (Array.isArray(data)) return data;
            if (typeof data === 'string') {
                const trimmed = data.trim();
                if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                    try {
                        const parsed = JSON.parse(trimmed);
                        if (Array.isArray(parsed)) return parsed;
                    } catch (e) {
                        return trimmed.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
                    }
                }
                return trimmed.split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
            }
            return [];
        };

        product.features = ensureArray(product.features);
        product.packContent = ensureArray(product.packContent);
        product.compatibility = ensureArray(product.compatibility);
        product.galleryImages = ensureArray(product.galleryImages);

        return product;
    }

    async create(createProductDto: CreateProductDto): Promise<Product> {
        const { discountId, ...rest } = createProductDto;
        const product = this.productsRepository.create({
            ...rest,
            discount: discountId ? { id: discountId } : null as any,
        });
        const savedProduct = await this.productsRepository.save(product);
        return this.sanitizeProduct(savedProduct);
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
        search?: string;
        isActive?: boolean;
        showAll?: boolean;
    }): Promise<[Product[], number]> {
        const qb = this.productsRepository.createQueryBuilder('product')
            .leftJoinAndSelect('product.discount', 'discount');

        if (options.isActive !== undefined) {
            qb.andWhere('product.isActive = :isActive', { isActive: options.isActive });
        } else if (!options.showAll) {
            // Default to showing only active products for public view unless showAll is true
            qb.andWhere('product.isActive = true');
        }

        if (options.category && options.category !== 'All') {
            qb.andWhere('product.category = :category', { category: options.category });
        }

        if (options.search) {
            qb.andWhere('(product.title ILIKE :search OR product.description ILIKE :search)', { search: `%${options.search}%` });
        }

        if (options.polyCount && options.polyCount !== 'All') {
            qb.andWhere(`product."technicalSpecs"->>'polyCount' = :polyCount`, { polyCount: options.polyCount });
        }

        if (options.rigged && options.rigged !== 'All') {
            qb.andWhere(`product."technicalSpecs"->>'rigged' = :rigged`, { rigged: options.rigged });
        }

        if (options.animated && options.animated !== 'All') {
            qb.andWhere(`product."technicalSpecs"->>'animated' = :animated`, { animated: options.animated });
        }

        if (options.textures && options.textures !== 'All') {
            qb.andWhere(`product."technicalSpecs"->>'textures' = :textures`, { textures: options.textures });
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

        const [products, total] = await qb.getManyAndCount();
        return [products.map(p => this.sanitizeProduct(p)), total];
    }

    async findAllProducts(): Promise<Product[]> {
        const products = await this.productsRepository.find({ order: { createdAt: 'DESC' } });
        return products.map(p => this.sanitizeProduct(p));
    }

    async findOne(id: string): Promise<Product | null> {
        const product = await this.productsRepository.findOne({ where: { id } });
        return product ? this.sanitizeProduct(product) : null;
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
        return this.sanitizeProduct(updatedProduct);
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
