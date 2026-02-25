import { Test, TestingModule } from '@nestjs/testing';
import { CouponsController } from './coupons.controller';
import { CouponsService } from './coupons.service';

describe('CouponsController', () => {
    let controller: CouponsController;
    let service: CouponsService;

    const mockCoupon = {
        id: '1',
        code: 'TEST10',
        discountPercentage: 10,
        isActive: true,
        currentUses: 0,
        maxUses: 10,
    };

    const mockCouponsService = {
        create: jest.fn().mockResolvedValue(mockCoupon),
        findAll: jest.fn().mockResolvedValue([mockCoupon]),
        toggleActive: jest.fn().mockResolvedValue({ ...mockCoupon, isActive: false }),
        validate: jest.fn().mockResolvedValue({ valid: true, discountPercentage: 10 }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CouponsController],
            providers: [
                {
                    provide: CouponsService,
                    useValue: mockCouponsService,
                },
            ],
        }).compile();

        controller = module.get<CouponsController>(CouponsController);
        service = module.get<CouponsService>(CouponsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should call service create method', async () => {
            const dto = { code: 'TEST10', discountPercentage: 10, maxUses: 10 };
            const result = await controller.create(dto);
            expect(service.create).toHaveBeenCalledWith(dto);
            expect(result).toEqual(mockCoupon);
        });
    });

    describe('findAll', () => {
        it('should return array of coupons', async () => {
            const result = await controller.findAll();
            expect(service.findAll).toHaveBeenCalled();
            expect(result).toEqual([mockCoupon]);
        });
    });

    describe('toggleActive', () => {
        it('should toggle active status by id', async () => {
            const result = await controller.toggleActive('1');
            expect(service.toggleActive).toHaveBeenCalledWith('1');
            expect(result.isActive).toBe(false);
        });
    });

    describe('validate', () => {
        it('should validate a coupon code', async () => {
            const result = await controller.validate('TEST10');
            expect(service.validate).toHaveBeenCalledWith('TEST10');
            expect(result).toEqual({ valid: true, discountPercentage: 10 });
        });
    });
});
