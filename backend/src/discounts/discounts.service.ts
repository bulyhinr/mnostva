import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Discount } from './entities/discount.entity';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';

@Injectable()
export class DiscountsService {
    constructor(
        @InjectRepository(Discount)
        private discountsRepository: Repository<Discount>,
    ) { }

    create(createDiscountDto: CreateDiscountDto) {
        const discount = this.discountsRepository.create(createDiscountDto);
        return this.discountsRepository.save(discount);
    }

    findAll() {
        return this.discountsRepository.find({ order: { createdAt: 'DESC' } });
    }

    async findOne(id: string) {
        const discount = await this.discountsRepository.findOneBy({ id });
        if (!discount) {
            throw new NotFoundException(`Discount with ID ${id} not found`);
        }
        return discount;
    }

    async update(id: string, updateDiscountDto: UpdateDiscountDto) {
        const discount = await this.findOne(id);
        Object.assign(discount, updateDiscountDto);
        return this.discountsRepository.save(discount);
    }

    async remove(id: string) {
        const result = await this.discountsRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Discount with ID ${id} not found`);
        }
        return { deleted: true };
    }
}
