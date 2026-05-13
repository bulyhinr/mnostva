import { Controller, Post, Body, Req, UseGuards, UnauthorizedException, Get, Query } from '@nestjs/common';
import { DownloadsService } from './downloads.service';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../auth/admin.guard';
import { OrdersService } from '../orders/orders.service';
import { ProductsService } from '../products/products.service';

@Controller('downloads')
export class DownloadsController {
    constructor(
        private readonly downloadsService: DownloadsService,
        private readonly ordersService: OrdersService,
        private readonly productsService: ProductsService,
    ) { }

    @UseGuards(AuthGuard('jwt'), AdminGuard)
    @Get('logs')
    async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 30) {
        return this.downloadsService.findAll(Number(page), Number(limit));
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('generate')
    async generateDownloadLink(@Req() req, @Body('productId') productId: string) {
        const user = req.user;

        // 1. Verify product exists
        const product = await this.productsService.findOne(productId);
        if (!product) {
            throw new UnauthorizedException('Product not found');
        }

        // 2. Verify purchase (TODO: Implement checkPurchase logic in OrdersService)
        // const hasPurchased = await this.ordersService.checkPurchase(user.userId, productId);
        // if (!hasPurchased && !user.isAdmin) {
        //   throw new UnauthorizedException('Please purchase this product to download');
        // }

        // 3. Generate signed URL
        const url = await this.downloadsService.generateSignedUrl(product.fileKey);

        // 4. Log download
        await this.downloadsService.logDownload({
            user: { id: user.userId } as any,
            product: { id: productId } as any,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });

        return { downloadUrl: url, expiresAt: new Date(Date.now() + 600 * 1000) };
    }
}
