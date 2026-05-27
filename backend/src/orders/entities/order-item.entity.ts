import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Order, (order) => order.items)
    @JoinColumn({ name: 'order_id' })
    order: Order;

    @ManyToOne(() => Product, (product) => product.orderItems, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @Column({ type: 'int' })
    price: number; // Historical price at purchase time (in cents)

    @Column({ type: 'int', default: 1 })
    quantity: number;

    @Column({ name: 'original_price', type: 'int', nullable: true })
    originalPrice: number | null; // Original price before product discount (in cents)

    @Column({ name: 'discount_percentage', type: 'int', nullable: true })
    discountPercentage: number | null; // Product discount percentage applied

    @Column({ type: 'varchar', default: 'standard' })
    licenseType: string; // 'standard' or 'commercial'
}
