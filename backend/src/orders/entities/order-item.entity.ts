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
}
