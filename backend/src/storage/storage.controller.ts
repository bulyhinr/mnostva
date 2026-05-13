import { Controller, Post, Body, UseGuards, Request, NotFoundException, ForbiddenException, BadRequestException, Get, Param, Res } from '@nestjs/common';
import { StorageService } from './storage.service';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from '../orders/orders.service';
import { AdminGuard } from '../auth/admin.guard';
import { v4 as uuidv4 } from 'uuid';
import type { Response } from 'express';
import { ProductsService } from '../products/products.service';
import { DownloadsService } from '../downloads/downloads.service';

@Controller('storage')
export class StorageController {
    constructor(
        private readonly storageService: StorageService,
        private readonly ordersService: OrdersService,
        private readonly productsService: ProductsService,
        private readonly downloadsService: DownloadsService,
    ) { }

    @Get('public/*key')
    async getPublicFile(@Param() params: Record<string, any>, @Res() res: Response) {
        let key = params[0] || params['key'];

        // Handle array (if wildcard matches multiple segments)
        if (Array.isArray(key)) {
            key = key.join('/');
        }

        if (!key || typeof key !== 'string') {
            throw new NotFoundException('File key invalid or missing');
        }

        // The wildcard typically strips the prefix path. We must ensure the key passed to service
        // starts with 'public/' because generated keys are stored as 'public/uuid.ext'
        const fullKey = key.startsWith('public/') ? key : `public/${key}`;

        try {
            const signedUrl = await this.storageService.generateDownloadUrl(fullKey);
            return res.redirect(signedUrl);
        } catch (e: any) {
            console.error(`Failed to serve public file ${fullKey}:`, e.message);
            throw new NotFoundException('File not found');
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('generate-upload')
    async generateUploadLink(@Request() req, @Body() body: { contentType: string, isPublic?: boolean }) {
        if (!body.contentType) {
            body.contentType = 'application/octet-stream';
        }

        const isAdmin = req.user.isAdmin;

        // Non-admins can only upload public files (avatars)
        if (!isAdmin && body.isPublic === false) {
            throw new ForbiddenException('Only admins can upload private assets');
        }

        // Force public for non-admins to be safe, though check above covers it if they sent false. 
        // If they sent nothing, isPublic undefined -> typical logic might default? 
        // Existing logic: const folder = body.isPublic ? 'public' : 'products';
        // If isPublic is undefined, folder is 'products'. We must prevent that for non-admins.

        // Enforce isPublic for non-admins
        const isPublic = isAdmin ? body.isPublic : true;

        const extension = body.contentType.split('/')[1] || 'bin';
        const folder = isPublic ? 'public' : 'products';
        const key = `${folder}/${uuidv4()}.${extension}`;

        const uploadUrl = await this.storageService.generateUploadUrl(key, body.contentType);

        return { uploadUrl, key };
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('generate-download')
    async generateDownloadLink(@Request() req, @Body() body: { productId: string }) {
        const userId = req.user.userId;
        const isAdmin = req.user.isAdmin;
        const productId = body.productId;
        let fileKey: string;

        if (isAdmin) {
            const product = await this.productsService.findOne(productId);
            if (!product) throw new NotFoundException('Product not found');
            
            if (!product.isActive) {
                throw new ForbiddenException('This asset is temporarily unavailable for download (Status: Off).');
            }
            
            fileKey = product.fileKey;
        } else {
            // 1. Verify user purchased the product
            const orders = await this.ordersService.findByUser(userId);

            const hasPurchased = orders.some(order =>
                (order.status === 'paid' || order.status === 'fulfilled') &&
                order.items.some(item => item.product.id === productId)
            );

            if (!hasPurchased) {
                throw new ForbiddenException('You have not purchased this asset.');
            }

            // 2. Get Product File Key from order
            const order = orders.find(o => o.items.some(i => i.product.id === productId));
            if (!order) {
                throw new NotFoundException('Order not found.');
            }
            const item = order.items.find(i => i.product.id === productId);
            if (!item || !item.product) {
                throw new NotFoundException('Asset file not found.');
            }

            // Check if product is active
            if (!item.product.isActive) {
                throw new ForbiddenException('This asset is temporarily unavailable for download.');
            }

            fileKey = item.product.fileKey;
        }

        if (!fileKey) {
            throw new NotFoundException('Asset file key is missing for this product.');
        }

        const signedUrl = await this.storageService.generateDownloadUrl(fileKey);

        // Log download
        try {
            await this.downloadsService.logDownload({
                user: { id: req.user.userId } as any,
                product: { id: productId } as any,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            });
        } catch (e) {
            console.error('Failed to log download:', e.message);
        }

        return { downloadUrl: signedUrl, expiresAt: new Date(Date.now() + 600 * 1000) };
    }
}
