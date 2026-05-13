import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
    let controller: ProductsController;
    let service: any;

    beforeEach(async () => {
        service = {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProductsController],
            providers: [
                {
                    provide: ProductsService,
                    useValue: service,
                },
            ],
        }).compile();

        controller = module.get<ProductsController>(ProductsController);
    });

    describe('findAll', () => {
        it('should return paginated products', async () => {
            const result = [[{ id: '1' }], 10];
            service.findAll.mockResolvedValue(result);

            const query = { page: 1, limit: 10 };
            expect(await controller.findAll(query)).toEqual({
                data: result[0],
                total: result[1],
                page: 1,
                limit: 10,
            });
        });

        it('should pass technical specs and status filters to service', async () => {
            const result = [[{ id: '1' }], 10];
            service.findAll.mockResolvedValue(result);

            const query = {
                page: 1,
                limit: 10,
                polyCount: 'Low',
                rigged: 'Yes',
                animated: 'No',
                textures: 'Included',
                isActive: 'true',
                showAll: 'false'
            };
            await controller.findAll(query);
            expect(service.findAll).toHaveBeenCalledWith({
                page: 1,
                limit: 10,
                category: undefined,
                sortBy: undefined,
                polyCount: 'Low',
                rigged: 'Yes',
                animated: 'No',
                textures: 'Included',
                isActive: true,
                showAll: false,
                search: undefined
            });
        });
    });

    describe('create', () => {
        it('should create product', async () => {
            const dto = { title: 'T' } as any;
            service.create.mockResolvedValue(dto);
            expect(await controller.create(dto)).toEqual(dto);
        });
    });

    describe('findOne', () => {
        it('should find one', async () => {
            const p = { id: '1' };
            service.findOne.mockResolvedValue(p);
            expect(await controller.findOne('1')).toEqual(p);
        });
    });

    describe('update', () => {
        it('should update', async () => {
            const dto = { title: 'U' };
            service.update.mockResolvedValue(dto);
            expect(await controller.update('1', dto)).toEqual(dto);
        });
    });

    describe('remove', () => {
        it('should remove', async () => {
            service.remove.mockResolvedValue(undefined);
            expect(await controller.remove('1')).toBeUndefined();
        });
    });
});
