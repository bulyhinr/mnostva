import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne } from 'typeorm';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { Discount } from '../../discounts/entities/discount.entity';

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'int' })
    price: number; // In cents (e.g., 4500 = $45.00)

    @Column({ name: 'file_key' })
    fileKey: string; // Cloudflare R2 object key (NOT URL)

    @Column({ name: 'preview_image_key', nullable: true })
    previewImageKey: string;

    @Column({ name: 'gallery_images', type: 'simple-array', nullable: true })
    galleryImages: string[];

    @Column({ nullable: true })
    category: string;

    @Column({ type: 'simple-array', nullable: true })
    features: string[];

    @Column({ type: 'simple-array', nullable: true })
    packContent: string[];

    @Column({ type: 'simple-array', nullable: true })
    compatibility: string[];

    @Column({ type: 'jsonb', nullable: true })
    technicalSpecs: {
        polyCount?: string;
        textures?: string;
        rigged?: boolean;
        animated?: boolean;
    };

    @Column({ type: 'jsonb', nullable: true })
    externalLinks: {
        unity?: string;
        fab?: string;
        cgtrader?: string;
        artstation?: string;
    };

    @ManyToOne(() => Discount, (discount) => discount.products, { nullable: true, eager: true, onDelete: 'SET NULL' })
    discount: Discount;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
    orderItems: OrderItem[];
}
