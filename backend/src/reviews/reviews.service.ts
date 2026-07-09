import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class ReviewsService {
    private readonly logger = new Logger(ReviewsService.name);

    constructor(
        @InjectRepository(Review)
        private reviewsRepository: Repository<Review>,
        @InjectRepository(OrderItem)
        private orderItemsRepository: Repository<OrderItem>,
        @InjectRepository(Product)
        private productsRepository: Repository<Product>,
        private emailService: EmailService,
    ) { }

    async create(userId: string, createReviewDto: CreateReviewDto): Promise<Review> {
        const { productId, rating, comment } = createReviewDto;

        if (rating < 1 || rating > 5) {
            throw new BadRequestException('Rating must be between 1 and 5');
        }

        const product = await this.productsRepository.findOneBy({ id: productId });
        if (!product) {
            throw new NotFoundException(`Product ${productId} not found`);
        }

        // Verify purchase
        const hasPurchased = await this.orderItemsRepository.findOne({
            where: {
                product: { id: productId },
                order: {
                    user: { id: userId },
                    status: 'paid',
                },
            },
            relations: ['order', 'order.user'],
        });

        if (!hasPurchased) {
            throw new BadRequestException('You can only review products you have purchased.');
        }

        // Check if already reviewed? Optional, but good practice.
        const existingReview = await this.reviewsRepository.findOne({
            where: {
                user: { id: userId },
                product: { id: productId },
            },
        });

        if (existingReview) {
            throw new BadRequestException('You have already reviewed this product.');
        }

        const review = this.reviewsRepository.create({
            rating,
            comment,
            user: { id: userId } as any,
            product: { id: productId } as any,
        });

        const savedReview = await this.reviewsRepository.save(review);

        // Send admin review alert
        this.emailService.sendAdminReviewAlert(
            savedReview,
            product.title,
            hasPurchased.order?.user?.email || 'Unknown User'
        ).catch(err => {
            this.logger.error(`Failed to send admin review alert email: ${err.message}`);
        });

        return savedReview;
    }

    async findAllByProduct(productId: string): Promise<Review[]> {
        return this.reviewsRepository.find({
            where: { product: { id: productId } },
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
    }

    async getAverageRating(productId: string): Promise<{ average: number; count: number }> {
        const result = await this.reviewsRepository
            .createQueryBuilder('review')
            .select('AVG(review.rating)', 'average')
            .addSelect('COUNT(review.id)', 'count')
            .where('review.product = :productId', { productId })
            .getRawOne();

        return {
            average: parseFloat(result.average || 0),
            count: parseInt(result.count || 0, 10),
        };
    }
    async findLatestReviews(limit: number = 10): Promise<Review[]> {
        return this.reviewsRepository.find({
            relations: ['user', 'product'],
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }

    async findAllByUser(userId: string): Promise<Review[]> {
        return this.reviewsRepository.find({
            where: { user: { id: userId } },
            relations: ['product'],
            order: { createdAt: 'DESC' },
        });
    }
}
