import { Test, TestingModule } from '@nestjs/testing';
import { DiscountsService } from './discounts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Discount } from './entities/discount.entity';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

describe('DiscountsService', () => {
    let service: DiscountsService;
    let repository: jest.Mocked<Partial<Repository<Discount>>>;

    const mockDiscount = {
        id: '1',
        name: 'test',
        percentage: 10,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        repository = {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOneBy: jest.fn(),
            delete: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DiscountsService,
                {
                    provide: getRepositoryToken(Discount),
                    useValue: repository,
                },
            ],
        }).compile();

        service = module.get<DiscountsService>(DiscountsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a discount', async () => {
            const dto = { name: 'test', percentage: 10, isActive: true };
            repository.create.mockReturnValue({ ...dto } as any);
            repository.save.mockResolvedValue({ id: '1', ...dto } as any);

            const result = await service.create(dto);
            expect(result).toHaveProperty('id');
            expect(result.name).toBe('test');
            expect(repository.create).toHaveBeenCalledWith(dto);
            expect(repository.save).toHaveBeenCalled();
        });
    });

    describe('findAll', () => {
        it('should return an array of discounts', async () => {
            repository.find.mockResolvedValue([mockDiscount as any]);
            const result = await service.findAll();
            expect(result).toEqual([mockDiscount]);
            expect(repository.find).toHaveBeenCalledWith({ order: { createdAt: 'DESC' } });
        });
    });

    describe('findOne', () => {
        it('should get a discount', async () => {
            repository.findOneBy.mockResolvedValue(mockDiscount as any);
            const result = await service.findOne('1');
            expect(result).toEqual(mockDiscount);
        });

        it('should throw NotFoundException if not found', async () => {
            repository.findOneBy.mockResolvedValue(null);
            await expect(service.findOne('99')).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update a discount', async () => {
            repository.findOneBy.mockResolvedValue(mockDiscount as any);
            repository.save.mockImplementation(async (d: any) => d);

            const result = await service.update('1', { percentage: 20 });
            expect(result.percentage).toBe(20);
            expect(repository.save).toHaveBeenCalled();
        });
    });

    describe('remove', () => {
        it('should remove a discount', async () => {
            repository.delete.mockResolvedValue({ affected: 1 } as any);
            const result = await service.remove('1');
            expect(result).toEqual({ deleted: true });
        });

        it('should throw NotFoundException if not found on delete', async () => {
            repository.delete.mockResolvedValue({ affected: 0 } as any);
            await expect(service.remove('99')).rejects.toThrow(NotFoundException);
        });
    });
});
