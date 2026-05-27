import { Controller, Post, Body, Req, UseGuards, UnauthorizedException, Get, Query, Logger } from '@nestjs/common';
import { DownloadsService } from './downloads.service';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../auth/admin.guard';
import { OrdersService } from '../orders/orders.service';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';

@Controller('downloads')
export class DownloadsController {
    private readonly logger = new Logger(DownloadsController.name);

    constructor(
        private readonly downloadsService: DownloadsService,
        private readonly ordersService: OrdersService,
        private readonly productsService: ProductsService,
        private readonly usersService: UsersService,
        private readonly emailService: EmailService,
    ) { }

    @UseGuards(AuthGuard('jwt'), AdminGuard)
    @Get('logs')
    async findAll(
        @Query('page') page: number = 1, 
        @Query('limit') limit: number = 30,
        @Query('title') title?: string,
        @Query('email') email?: string
    ) {
        return this.downloadsService.findAll(Number(page), Number(limit), title, email);
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

        // Check if user has downloaded this product before logging the current download
        const hasDownloadedBefore = await this.downloadsService.hasDownloadedBefore(user.userId, productId);

        // 3. Generate signed URL
        const url = await this.downloadsService.generateSignedUrl(product.fileKey);

        // 4. Log download
        await this.downloadsService.logDownload({
            user: { id: user.userId } as any,
            product: { id: productId } as any,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });

        // 5. Send feedback reminder email if first time downloading this asset pack
        if (!hasDownloadedBefore) {
            try {
                const fullUser = await this.usersService.findOne(user.userId);
                if (fullUser) {
                    await this.emailService.sendFeedbackReminderEmail(
                        fullUser.email,
                        fullUser.name || 'Creative',
                        product.title
                    );
                }
            } catch (err) {
                this.logger.error(`Failed to send feedback email: ${err.message}`);
            }
        }

        return { downloadUrl: url, expiresAt: new Date(Date.now() + 600 * 1000) };
    }
}
