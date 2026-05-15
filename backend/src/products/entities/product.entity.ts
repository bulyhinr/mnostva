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

    @Column({ type: 'int', nullable: true })
    commercialPrice: number; // Optional commercial license price (in cents)

    @Column({ name: 'file_key' })
    fileKey: string; // Cloudflare R2 object key (NOT URL)

    @Column({ name: 'file_name', nullable: true })
    fileName: string; // Original filename of the uploaded asset zip

    @Column({ name: 'preview_image_key', nullable: true })
    previewImageKey: string;

    @Column({ name: 'preview_model_key', nullable: true })
    previewModelKey: string; // Cloudflare R2 key for the .glb/.gltf model

    @Column({ name: 'preview_model_name', nullable: true })
    previewModelName: string; // Original filename of the 3D model

    @Column({ name: 'gallery_images', type: 'jsonb', nullable: true })
    galleryImages: string[];

    @Column({ nullable: true })
    category: string;

    @Column({ type: 'jsonb', nullable: true })
    features: string[];

    @Column({ type: 'jsonb', nullable: true })
    packContent: string[];

    @Column({ type: 'jsonb', nullable: true })
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
        sketchfab?: string;
        superhive?: string;
        youtube?: string;
    };

    @Column({ default: true })
    isActive: boolean;

    @ManyToOne(() => Discount, (discount) => discount.products, { nullable: true, eager: true, onDelete: 'SET NULL' })
    discount: Discount;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
    orderItems: OrderItem[];

    @OneToMany('Review', (review: any) => review.product)
    reviews: any[];

    @OneToMany('WishlistItem', (item: any) => item.product)
    wishlistItems: any[];
}
