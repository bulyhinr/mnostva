import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('download_logs')
export class DownloadLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, (user) => user.downloadLogs)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Product, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @Column({ name: 'ip_address', nullable: true })
    ipAddress: string;

    @Column({ name: 'user_agent', nullable: true })
    userAgent: string;

    @CreateDateColumn({ name: 'downloaded_at' })
    downloadedAt: Date;
}
