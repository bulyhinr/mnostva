import { Test, TestingModule } from '@nestjs/testing';
import { DownloadsController } from './downloads.controller';
import { DownloadsService } from './downloads.service';
import { OrdersService } from '../orders/orders.service';
import { ProductsService } from '../products/products.service';
import { UnauthorizedException } from '@nestjs/common';

describe('DownloadsController', () => {
    let controller: DownloadsController;
    let downloadsService: jest.Mocked<Partial<DownloadsService>>;
    let ordersService: jest.Mocked<Partial<OrdersService>>;
    let productsService: jest.Mocked<Partial<ProductsService>>;

    beforeEach(async () => {
        downloadsService = {
            generateSignedUrl: jest.fn(),
            logDownload: jest.fn(),
        };

        ordersService = {
            // Add methods if used
        };

        productsService = {
            findOne: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [DownloadsController],
            providers: [
                { provide: DownloadsService, useValue: downloadsService },
                { provide: OrdersService, useValue: ordersService },
                { provide: ProductsService, useValue: productsService },
            ],
        }).compile();

        controller = module.get<DownloadsController>(DownloadsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should throw if product not found', async () => {
        productsService.findOne.mockResolvedValue(null);

        const req = { user: { userId: '1' } };
        await expect(controller.generateDownloadLink(req, '123')).rejects.toThrow(UnauthorizedException);
    });

    it('should generate download link and log', async () => {
        productsService.findOne.mockResolvedValue({ fileKey: 'test.zip' } as any);
        downloadsService.generateSignedUrl.mockResolvedValue('url');
        downloadsService.logDownload.mockResolvedValue({} as any);

        const req = { user: { userId: 'user-1' }, ip: '127.0.0.1', headers: { 'user-agent': 'agent' } };
        const result = await controller.generateDownloadLink(req, '123');

        expect(result).toHaveProperty('downloadUrl', 'url');
        expect(result).toHaveProperty('expiresAt');
        expect(downloadsService.generateSignedUrl).toHaveBeenCalledWith('test.zip');
        expect(downloadsService.logDownload).toHaveBeenCalledWith({
            user: { id: 'user-1' },
            product: { id: '123' },
            ipAddress: '127.0.0.1',
            userAgent: 'agent',
        });
    });
});
