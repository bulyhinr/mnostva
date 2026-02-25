import { Controller, Get, Header } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProductsService } from './products/products.service';

@Controller('sitemap.xml')
export class SitemapController {
    constructor(
        private readonly productsService: ProductsService,
        private readonly configService: ConfigService,
    ) { }

    @Get()
    @Header('Content-Type', 'application/xml')
    async getSitemap(): Promise<string> {
        const products = await this.productsService.findAllProducts();
        const baseUrl = this.configService.get<string>('FRONTEND_URL') || 'https://mnostva.art';

        let urls = '';
        for (const product of products) {
            if (product.id) {
                const lastmod = product.updatedAt ? product.updatedAt.toISOString().split('T')[0] : (product.createdAt ? product.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
                urls += `
  <url>
    <loc>${baseUrl}/product/${product.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
            }
        }

        return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/marketplace</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>${urls}
</urlset>`;
    }
}
