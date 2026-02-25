import { Test, TestingModule } from '@nestjs/testing';
import { SitemapController } from './sitemap.controller';
import { ProductsService } from './products/products.service';
import { ConfigService } from '@nestjs/config';

describe('SitemapController', () => {
    let controller: SitemapController;
    let productsService;

    beforeEach(async () => {
        productsService = {
            findAllProducts: jest.fn().mockResolvedValue([
                { id: '1', createdAt: new Date('2024-01-01T00:00:00Z'), updatedAt: new Date('2024-01-02T00:00:00Z') },
                { id: '2', createdAt: new Date('2024-02-01T00:00:00Z') },
            ]),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [SitemapController],
            providers: [
                { provide: ProductsService, useValue: productsService },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn().mockReturnValue('https://mnostva.art'),
                    },
                },
            ],
        }).compile();

        controller = module.get<SitemapController>(SitemapController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should generate a sitemap', async () => {
        const xml = await controller.getSitemap();
        expect(productsService.findAllProducts).toHaveBeenCalled();
        expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
        expect(xml).toContain('<loc>https://mnostva.art/product/1</loc>');
        expect(xml).toContain('<loc>https://mnostva.art/product/2</loc>');
        expect(xml).toContain('<lastmod>2024-01-02</lastmod>');
        expect(xml).toContain('<lastmod>2024-02-01</lastmod>');
    });
});
