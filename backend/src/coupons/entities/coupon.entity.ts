import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('coupons')
export class Coupon {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    code: string;

    @Column('int')
    discountPercentage: number;

    @Column({ default: true })
    isActive: boolean;

    @Column('int', { default: 0 })
    currentUses: number;

    @Column('int', { nullable: true })
    maxUses: number;

    @CreateDateColumn()
    createdAt: Date;
}
