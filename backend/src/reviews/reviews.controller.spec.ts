import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

describe('ReviewsController', () => {
    let controller: ReviewsController;
    let service: jest.Mocked<Partial<ReviewsService>>;

    beforeEach(async () => {
        service = {
            create: jest.fn(),
            findAllByProduct: jest.fn(),
            getAverageRating: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [ReviewsController],
            providers: [{ provide: ReviewsService, useValue: service }],
        }).compile();

        controller = module.get<ReviewsController>(ReviewsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should create a review', async () => {
        const dto = { productId: '1', rating: 5, comment: 'Nice' };
        service.create.mockResolvedValue('created' as any);
        expect(await controller.create({ user: { userId: '1' } }, dto)).toBe('created');
        expect(service.create).toHaveBeenCalledWith('1', dto);
    });

    it('should find all by product', async () => {
        service.findAllByProduct.mockResolvedValue('all' as any);
        expect(await controller.findAll('1')).toBe('all');
    });

    it('should get stats', async () => {
        service.getAverageRating.mockResolvedValue('stats' as any);
        expect(await controller.getStats('1')).toBe('stats');
    });
});
