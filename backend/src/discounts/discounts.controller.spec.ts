import { Test, TestingModule } from '@nestjs/testing';
import { DiscountsController } from './discounts.controller';
import { DiscountsService } from './discounts.service';

describe('DiscountsController', () => {
    let controller: DiscountsController;
    let service: jest.Mocked<Partial<DiscountsService>>;

    beforeEach(async () => {
        service = {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [DiscountsController],
            providers: [{ provide: DiscountsService, useValue: service }],
        }).compile();

        controller = module.get<DiscountsController>(DiscountsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should create a discount', async () => {
        service.create.mockResolvedValue('created' as any);
        expect(await controller.create({ name: 'test', percentage: 10, isActive: true })).toBe('created');
    });

    it('should find all discounts', async () => {
        service.findAll.mockResolvedValue('all' as any);
        expect(await controller.findAll()).toBe('all');
    });

    it('should find one discount', async () => {
        service.findOne.mockResolvedValue('one' as any);
        expect(await controller.findOne('1')).toBe('one');
    });

    it('should update a discount', async () => {
        service.update.mockResolvedValue('updated' as any);
        expect(await controller.update('1', { percentage: 20 })).toBe('updated');
    });

    it('should remove a discount', async () => {
        service.remove.mockResolvedValue('removed' as any);
        expect(await controller.remove('1')).toBe('removed');
    });
});
