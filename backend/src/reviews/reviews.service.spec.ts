import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { EmailService } from '../email/email.service';

describe('ReviewsService', () => {
    let service: ReviewsService;
    let reviewsRepository: jest.Mocked<Partial<Repository<Review>>>;
    let orderItemsRepository: jest.Mocked<Partial<Repository<OrderItem>>>;
    let productsRepository: jest.Mocked<Partial<Repository<Product>>>;
    let emailService: jest.Mocked<Partial<EmailService>>;

    beforeEach(async () => {
        reviewsRepository = {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnThis(),
                addSelect: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                getRawOne: jest.fn().mockResolvedValue({ average: '4.5', count: '10' }),
            }),
        };

        orderItemsRepository = {
            findOne: jest.fn(),
        };

        productsRepository = {
            findOneBy: jest.fn(),
        };

        emailService = {
            sendAdminReviewAlert: jest.fn().mockResolvedValue(undefined as any),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReviewsService,
                { provide: getRepositoryToken(Review), useValue: reviewsRepository },
                { provide: getRepositoryToken(OrderItem), useValue: orderItemsRepository },
                { provide: getRepositoryToken(Product), useValue: productsRepository },
                { provide: EmailService, useValue: emailService },
            ],
        }).compile();

        service = module.get<ReviewsService>(ReviewsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        const dto = { productId: '1', rating: 5, comment: 'Great' };

        it('should throw if rating invalid', async () => {
            await expect(service.create('1', { ...dto, rating: 6 })).rejects.toThrow(BadRequestException);
        });

        it('should throw if product not found', async () => {
            (productsRepository.findOneBy as any).mockResolvedValue(null);
            await expect(service.create('1', dto)).rejects.toThrow(NotFoundException);
        });

        it('should throw if user did not purchase', async () => {
            (productsRepository.findOneBy as any).mockResolvedValue({} as any);
            (orderItemsRepository.findOne as any).mockResolvedValue(null);
            await expect(service.create('1', dto)).rejects.toThrow(BadRequestException);
        });

        it('should throw if already reviewed', async () => {
            (productsRepository.findOneBy as any).mockResolvedValue({} as any);
            (orderItemsRepository.findOne as any).mockResolvedValue({} as any);
            (reviewsRepository.findOne as any).mockResolvedValue({} as any);
            await expect(service.create('1', dto)).rejects.toThrow(BadRequestException);
        });

        it('should create a review', async () => {
            (productsRepository.findOneBy as any).mockResolvedValue({} as any);
            (orderItemsRepository.findOne as any).mockResolvedValue({} as any);
            (reviewsRepository.findOne as any).mockResolvedValue(null);

            (reviewsRepository.create as any).mockReturnValue('new-review' as any);
            (reviewsRepository.save as any).mockResolvedValue('saved-review' as any);

            expect(await service.create('1', dto)).toBe('saved-review');
        });
    });

    describe('findAllByProduct', () => {
        it('should return reviews', async () => {
            (reviewsRepository.find as any).mockResolvedValue(['r'] as any);
            expect(await service.findAllByProduct('1')).toEqual(['r']);
        });
    });

    describe('getAverageRating', () => {
        it('should return average and count', async () => {
            const result = await service.getAverageRating('1');
            expect(result).toEqual({ average: 4.5, count: 10 });
        });
    });
});
