import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';

describe('ProductsService', () => {
    let service: ProductsService;
    let repoMock: any;

    beforeEach(async () => {
        repoMock = {
            find: jest.fn(),
            findAndCount: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            query: jest.fn().mockResolvedValue([]),
            manager: {
                transaction: jest.fn().mockImplementation(async (cb) => {
                    const entityManager = {
                        query: jest.fn(),
                        delete: jest.fn(),
                    };
                    return await cb(entityManager);
                }),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProductsService,
                {
                    provide: getRepositoryToken(Product),
                    useValue: repoMock,
                },
            ],
        }).compile();

        service = module.get<ProductsService>(ProductsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('onModuleInit', () => {
        it('should patch schema', async () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            repoMock.query.mockResolvedValue();
            await service.onModuleInit();
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Schema patched'));
            consoleSpy.mockRestore();
        });

        it('should catch error on schema patch', async () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
            repoMock.query.mockRejectedValue(new Error('Test DB Error'));
            await service.onModuleInit();
            expect(consoleSpy).toHaveBeenCalledWith('Schema patch skipped:', 'Test DB Error');
            consoleSpy.mockRestore();
        });
    });

    describe('create', () => {
        it('should create and save a product', async () => {
            const dto = { title: 'Test', price: 100, category: 'Cat' } as any;
            const savedProduct = { id: '1', ...dto };

            repoMock.create.mockReturnValue(savedProduct);
            repoMock.save.mockResolvedValue(savedProduct);

            expect(await service.create(dto)).toEqual(savedProduct);
            expect(repoMock.create).toHaveBeenCalledWith(expect.objectContaining(dto));
        });
    });

    describe('findAll', () => {
        let qbMock: any;

        beforeEach(() => {
            qbMock = {
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                take: jest.fn().mockReturnThis(),
                getManyAndCount: jest.fn().mockResolvedValue([[{ id: '1' }], 1]),
            };
            repoMock.createQueryBuilder = jest.fn().mockReturnValue(qbMock);
        });

        it('should return paginated products sorting default', async () => {
            const result = [[{ id: '1' }], 1];
            expect(await service.findAll({ page: 1, limit: 10 })).toEqual(result);
            expect(repoMock.createQueryBuilder).toHaveBeenCalledWith('product');
            expect(qbMock.skip).toHaveBeenCalledWith(0);
            expect(qbMock.take).toHaveBeenCalledWith(10);
            expect(qbMock.orderBy).toHaveBeenCalledWith('product.createdAt', 'DESC');
        });

        it('should return paginated products sorting by price-asc', async () => {
            const result = [[{ id: '1' }], 1];
            expect(await service.findAll({ page: 1, limit: 10, sortBy: 'price-asc', category: 'Testing' })).toEqual(result);
            expect(qbMock.andWhere).toHaveBeenCalledWith('product.category = :category', { category: 'Testing' });
            expect(qbMock.orderBy).toHaveBeenCalledWith('product.price', 'ASC');
        });

        it('should return paginated products sorting by price-desc', async () => {
            const result = [[{ id: '1' }], 1];
            expect(await service.findAll({ page: 1, limit: 10, sortBy: 'price-desc' })).toEqual(result);
            expect(qbMock.orderBy).toHaveBeenCalledWith('product.price', 'DESC');
        });

        it('should return paginated products sorting by newest', async () => {
            const result = [[{ id: '1' }], 1];
            expect(await service.findAll({ page: 1, limit: 10, sortBy: 'newest' })).toEqual(result);
            expect(qbMock.orderBy).toHaveBeenCalledWith('product.createdAt', 'DESC');
        });

        it('should return paginated products sorting by unknown field', async () => {
            const result = [[{ id: '1' }], 1];
            expect(await service.findAll({ page: 1, limit: 10, sortBy: 'unknown' })).toEqual(result);
            expect(qbMock.orderBy).toHaveBeenCalledWith('product.unknown', 'DESC');
        });

        it('should add filters for technicalSpecs when provided', async () => {
            const result = [[{ id: '1' }], 1];
            expect(await service.findAll({
                page: 1,
                limit: 10,
                polyCount: 'Low',
                rigged: 'Yes',
                animated: 'No',
                textures: 'Included'
            })).toEqual(result);
            expect(qbMock.andWhere).toHaveBeenCalledWith(`product.technicalSpecs->>'polyCount' = :polyCount`, { polyCount: 'Low' });
            expect(qbMock.andWhere).toHaveBeenCalledWith(`product.technicalSpecs->>'rigged' = :rigged`, { rigged: 'Yes' });
            expect(qbMock.andWhere).toHaveBeenCalledWith(`product.technicalSpecs->>'animated' = :animated`, { animated: 'No' });
            expect(qbMock.andWhere).toHaveBeenCalledWith(`product.technicalSpecs->>'textures' = :textures`, { textures: 'Included' });
        });
    });

    describe('findAllProducts', () => {
        it('should return all products array', async () => {
            repoMock.find.mockResolvedValue([{ id: '1' }]);
            expect(await service.findAllProducts()).toEqual([{ id: '1' }]);
        });
    });

    describe('update', () => {
        it('should update product and return it', async () => {
            repoMock.update.mockResolvedValue({ affected: 1 });
            repoMock.findOne.mockResolvedValue({ id: '1', title: 'New' });

            expect(await service.update('1', { title: 'New', discountId: 'disc-id' } as any)).toEqual({ id: '1', title: 'New' });
            expect(repoMock.update).toHaveBeenCalledWith('1', { title: 'New', discount: { id: 'disc-id' } });
        });

        it('should update product setting discountId to null', async () => {
            repoMock.update.mockResolvedValue({ affected: 1 });
            repoMock.findOne.mockResolvedValue({ id: '1', title: 'New' });

            expect(await service.update('1', { discountId: null } as any)).toEqual({ id: '1', title: 'New' });
            expect(repoMock.update).toHaveBeenCalledWith('1', { discount: null });
        });

        it('should throw if updated product not found', async () => {
            repoMock.update.mockResolvedValue({ affected: 1 });
            repoMock.findOne.mockResolvedValue(null);

            await expect(service.update('1', {} as any)).rejects.toThrow('Product not found');
        });
    });

    describe('findOne', () => {
        it('should find one product by id', async () => {
            const product = { id: '1' };
            repoMock.findOne.mockResolvedValue(product);

            expect(await service.findOne('1')).toEqual(product);
        });
    });

    describe('remove', () => {
        it('should execute transaction to nullify references and delete product', async () => {
            repoMock.findOne.mockResolvedValue({ id: '1' });

            await service.remove('1');

            expect(repoMock.manager.transaction).toHaveBeenCalled();
        });

        it('should do nothing if product not found', async () => {
            repoMock.findOne.mockResolvedValue(null);
            await service.remove('999');
            expect(repoMock.manager.transaction).not.toHaveBeenCalled();
        });

        it('should throw error on delete failure', async () => {
            repoMock.findOne.mockResolvedValue({ id: '1' });
            repoMock.manager.transaction.mockRejectedValue(new Error('Tx Failed'));
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            await expect(service.remove('1')).rejects.toThrow('Tx Failed');
            consoleSpy.mockRestore();
        });
    });
});
