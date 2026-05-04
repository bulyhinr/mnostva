import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Order } from '../../orders/entities/order.entity';
import { DownloadLog } from '../../downloads/entities/download-log.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    avatar: string;

    @Column({ nullable: true })
    bio: string;

    @Column()
    @Exclude() // Hide password hash from JSON responses
    passwordHash: string;

    @Column({ type: 'varchar', nullable: true })
    @Exclude()
    resetToken: string | null;

    @Column({ type: 'timestamp', nullable: true })
    resetTokenExpiry: Date | null;

    @Column({ default: false })
    isAdmin: boolean;

    @Column({ type: 'timestamp', nullable: true })
    termsAcceptedAt: Date | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Order, (order) => order.user)
    orders: Order[];

    @OneToMany(() => DownloadLog, (log) => log.user)
    downloadLogs: DownloadLog[];

    @OneToMany('Review', (review: any) => review.user) // Use string to avoid circular dependency or import
    reviews: any[];

    @OneToMany('WishlistItem', (item: any) => item.user)
    wishlistItems: any[];
}
