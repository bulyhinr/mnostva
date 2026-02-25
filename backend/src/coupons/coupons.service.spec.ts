import { Test, TestingModule } from '@nestjs/testing';
import { CouponsService } from './coupons.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Coupon } from './entities/coupon.entity';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';

describe('CouponsService', () => {
    let service: CouponsService;
    let repository: any;

    const mockCoupon = {
        id: '1',
        code: 'TEST10',
        discountPercentage: 10,
        isActive: true,
        currentUses: 0,
        maxUses: 10,
    };

    const mockCouponRepository = {
        create: jest.fn().mockImplementation((dto) => dto),
        save: jest.fn().mockImplementation((dto) => Promise.resolve({ id: '1', ...dto })),
        findOne: jest.fn(),
        find: jest.fn().mockResolvedValue([mockCoupon]),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CouponsService,
                {
                    provide: getRepositoryToken(Coupon),
                    useValue: mockCouponRepository,
                },
            ],
        }).compile();

        service = module.get<CouponsService>(CouponsService);
        repository = module.get(getRepositoryToken(Coupon));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should successfully create a coupon', async () => {
            repository.findOne.mockResolvedValueOnce(null);

            const result = await service.create({ code: ' NEW20 ', discountPercentage: 20 });
            expect(repository.findOne).toHaveBeenCalledWith({ where: { code: 'NEW20' } });
            expect(repository.create).toHaveBeenCalledWith({ code: 'NEW20', discountPercentage: 20 });
            expect(repository.save).toHaveBeenCalledWith({ code: 'NEW20', discountPercentage: 20 });
            expect(result).toHaveProperty('id', '1');
            expect(result.code).toBe('NEW20');
        });

        it('should throw ConflictException if coupon exists', async () => {
            repository.findOne.mockResolvedValueOnce(mockCoupon);
            await expect(service.create({ code: 'TEST10', discountPercentage: 10 })).rejects.toThrow(ConflictException);
        });
    });

    describe('findAll', () => {
        it('should return an array of coupons', async () => {
            const result = await service.findAll();
            expect(repository.find).toHaveBeenCalledWith({ order: { createdAt: 'DESC' } });
            expect(result).toEqual([mockCoupon]);
        });
    });

    describe('validate', () => {
        it('should throw BadRequestException if code is empty', async () => {
            await expect(service.validate('')).rejects.toThrow(BadRequestException);
        });

        it('should throw NotFoundException if coupon is not found', async () => {
            repository.findOne.mockResolvedValueOnce(null);
            await expect(service.validate('INVALID')).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException if coupon is inactive', async () => {
            repository.findOne.mockResolvedValueOnce({ ...mockCoupon, isActive: false });
            await expect(service.validate('TEST10')).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException if coupon reached maxUses', async () => {
            repository.findOne.mockResolvedValueOnce({ ...mockCoupon, currentUses: 10, maxUses: 10 });
            await expect(service.validate('TEST10')).rejects.toThrow(BadRequestException);
        });

        it('should return valid and discountPercentage if coupon is valid', async () => {
            repository.findOne.mockResolvedValueOnce(mockCoupon);
            const result = await service.validate('  test10  ');
            expect(repository.findOne).toHaveBeenCalledWith({ where: { code: 'TEST10' } });
            expect(result).toEqual({ valid: true, discountPercentage: 10 });
        });
    });

    describe('incrementUses', () => {
        it('should increment currentUses and save if coupon exists', async () => {
            repository.findOne.mockResolvedValueOnce(mockCoupon);
            await service.incrementUses('TEST10');
            expect(repository.save).toHaveBeenCalledWith({ ...mockCoupon, currentUses: 1 });
        });

        it('should do nothing if coupon does not exist', async () => {
            repository.findOne.mockResolvedValueOnce(null);
            await service.incrementUses('INVALID');
            expect(repository.save).not.toHaveBeenCalled();
        });
    });

    describe('toggleActive', () => {
        it('should toggle isActive status and save', async () => {
            repository.findOne.mockResolvedValueOnce(mockCoupon);
            const result = await service.toggleActive('1');
            expect(repository.save).toHaveBeenCalledWith({ ...mockCoupon, isActive: false });
            expect(result.isActive).toBe(false);
        });

        it('should throw NotFoundException if coupon not found by id', async () => {
            repository.findOne.mockResolvedValueOnce(null);
            await expect(service.toggleActive('invalid')).rejects.toThrow(NotFoundException);
        });
    });
});
