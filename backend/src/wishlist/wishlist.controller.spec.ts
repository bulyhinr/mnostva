import { Test, TestingModule } from '@nestjs/testing';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';

describe('WishlistController', () => {
    let controller: WishlistController;
    let service: jest.Mocked<Partial<WishlistService>>;

    beforeEach(async () => {
        service = {
            toggle: jest.fn(),
            getWishlist: jest.fn(),
            checkStatus: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [WishlistController],
            providers: [{ provide: WishlistService, useValue: service }],
        }).compile();

        controller = module.get<WishlistController>(WishlistController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should toggle', async () => {
        service.toggle.mockResolvedValue({ status: 'added' });
        expect(await controller.toggle({ user: { userId: '1' } }, 'p1')).toEqual({ status: 'added' });
    });

    it('should find all', async () => {
        service.getWishlist.mockResolvedValue(['item'] as any);
        expect(await controller.findAll({ user: { userId: '1' } })).toEqual(['item']);
    });

    it('should check status', async () => {
        service.checkStatus.mockResolvedValue(true);
        expect(await controller.checkStatus({ user: { userId: '1' } }, 'p1')).toEqual({ inWishlist: true });
    });
});
