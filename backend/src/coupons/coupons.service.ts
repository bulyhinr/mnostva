import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from './entities/coupon.entity';

@Injectable()
export class CouponsService {
    constructor(
        @InjectRepository(Coupon)
        private couponsRepository: Repository<Coupon>,
    ) { }

    async create(createData: { code: string; discountPercentage: number; maxUses?: number }): Promise<Coupon> {
        const code = createData.code.toUpperCase().trim();
        const existing = await this.couponsRepository.findOne({ where: { code } });
        if (existing) {
            throw new ConflictException('Coupon code already exists');
        }
        const coupon = this.couponsRepository.create({
            ...createData,
            code,
        });
        return await this.couponsRepository.save(coupon);
    }

    async findAll(): Promise<Coupon[]> {
        return await this.couponsRepository.find({ order: { createdAt: 'DESC' } });
    }

    async validate(code: string): Promise<{ valid: boolean; discountPercentage: number; message?: string }> {
        if (!code) throw new BadRequestException('No coupon code provided');

        const coupon = await this.couponsRepository.findOne({ where: { code: code.toUpperCase().trim() } });

        if (!coupon) {
            throw new NotFoundException('Coupon code not found');
        }

        if (!coupon.isActive) {
            throw new BadRequestException('This coupon code is no longer active');
        }

        if (coupon.maxUses !== null && coupon.currentUses >= coupon.maxUses) {
            throw new BadRequestException('This coupon code has reached its usage limit');
        }

        return {
            valid: true,
            discountPercentage: coupon.discountPercentage,
        };
    }

    async incrementUses(code: string): Promise<void> {
        const coupon = await this.couponsRepository.findOne({ where: { code: code.toUpperCase().trim() } });
        if (coupon) {
            coupon.currentUses += 1;
            await this.couponsRepository.save(coupon);
        }
    }

    async toggleActive(id: string): Promise<Coupon> {
        const coupon = await this.couponsRepository.findOne({ where: { id } });
        if (!coupon) throw new NotFoundException('Coupon not found');
        coupon.isActive = !coupon.isActive;
        return await this.couponsRepository.save(coupon);
    }
}
