import { Test, TestingModule } from '@nestjs/testing';
import { WishlistService } from './wishlist.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WishlistItem } from './entities/wishlist-item.entity';
import { Product } from '../products/entities/product.entity';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

describe('WishlistService', () => {
    let service: WishlistService;
    let wishlistRepository: jest.Mocked<Partial<Repository<WishlistItem>>>;
    let productRepository: jest.Mocked<Partial<Repository<Product>>>;

    beforeEach(async () => {
        wishlistRepository = {
            findOne: jest.fn(),
            remove: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            count: jest.fn(),
        };

        productRepository = {
            findOneBy: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WishlistService,
                { provide: getRepositoryToken(WishlistItem), useValue: wishlistRepository },
                { provide: getRepositoryToken(Product), useValue: productRepository },
            ],
        }).compile();

        service = module.get<WishlistService>(WishlistService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('toggle', () => {
        it('should throw if product not found', async () => {
            productRepository.findOneBy.mockResolvedValue(null);
            await expect(service.toggle('1', 'p1')).rejects.toThrow(NotFoundException);
        });

        it('should remove if exists', async () => {
            productRepository.findOneBy.mockResolvedValue({ id: 'p1' } as any);
            wishlistRepository.findOne.mockResolvedValue({ id: 'w1' } as any);

            const result = await service.toggle('1', 'p1');
            expect(result).toEqual({ status: 'removed' });
            expect(wishlistRepository.remove).toHaveBeenCalled();
        });

        it('should add if not exists', async () => {
            productRepository.findOneBy.mockResolvedValue({ id: 'p1' } as any);
            wishlistRepository.findOne.mockResolvedValue(null);
            wishlistRepository.create.mockReturnValue({ id: 'w1' } as any);

            const result = await service.toggle('1', 'p1');
            expect(result).toEqual({ status: 'added' });
            expect(wishlistRepository.save).toHaveBeenCalled();
        });
    });

    describe('getWishlist', () => {
        it('should return wishlist', async () => {
            wishlistRepository.find.mockResolvedValue(['w1'] as any);
            expect(await service.getWishlist('1')).toEqual(['w1']);
        });
    });

    describe('checkStatus', () => {
        it('should check status', async () => {
            wishlistRepository.count.mockResolvedValue(1);
            expect(await service.checkStatus('1', 'p1')).toBe(true);
        });
    });
});
