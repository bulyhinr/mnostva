import { Controller, Post, Body, UseGuards, Request, NotFoundException, ForbiddenException, BadRequestException, Get, Param, Res } from '@nestjs/common';
import { StorageService } from './storage.service';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from '../orders/orders.service';
import { AdminGuard } from '../auth/admin.guard';
import { v4 as uuidv4 } from 'uuid';
import type { Response } from 'express';
import { ProductsService } from '../products/products.service';
import { DownloadsService } from '../downloads/downloads.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';

@Controller('storage')
export class StorageController {
    constructor(
        private readonly storageService: StorageService,
        private readonly ordersService: OrdersService,
        private readonly productsService: ProductsService,
        private readonly downloadsService: DownloadsService,
        private readonly usersService: UsersService,
        private readonly emailService: EmailService,
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

        // Force public for non-admins to be safe
        const isPublic = isAdmin ? body.isPublic : true;

        const extension = body.contentType.split('/')[1] || 'bin';
        const folder = isPublic ? 'public' : 'products';
        const key = `${folder}/${uuidv4()}.${extension}`;

        const uploadUrl = await this.storageService.generateUploadUrl(key, body.contentType);

        return { uploadUrl, key };
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('initiate-multipart')
    async initiateMultipart(@Request() req, @Body() body: { contentType: string, isPublic?: boolean }) {
        if (!body.contentType) {
            body.contentType = 'application/octet-stream';
        }

        const isAdmin = req.user.isAdmin;
        if (!isAdmin && body.isPublic === false) {
            throw new ForbiddenException('Only admins can upload private assets');
        }

        const isPublic = isAdmin ? body.isPublic : true;
        const extension = body.contentType.split('/')[1] || 'bin';
        const folder = isPublic ? 'public' : 'products';
        const key = `${folder}/${uuidv4()}.${extension}`;

        const uploadId = await this.storageService.initiateMultipartUpload(key, body.contentType);

        return { uploadId, key };
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('generate-multipart-url')
    async generateMultipartUrl(@Request() req, @Body() body: { key: string, uploadId: string, partNumber: number }) {
        const isAdmin = req.user.isAdmin;
        // Verify path permissions: non-admins cannot upload to non-public keys
        if (!isAdmin && !body.key.startsWith('public/')) {
            throw new ForbiddenException('Only admins can upload private assets');
        }

        if (!body.key || !body.uploadId || !body.partNumber) {
            throw new BadRequestException('Missing required fields: key, uploadId, partNumber');
        }

        const uploadUrl = await this.storageService.generateMultipartUploadPartUrl(body.key, body.uploadId, body.partNumber);
        return { uploadUrl };
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('complete-multipart')
    async completeMultipart(@Request() req, @Body() body: { key: string, uploadId: string }) {
        const isAdmin = req.user.isAdmin;
        if (!isAdmin && !body.key.startsWith('public/')) {
            throw new ForbiddenException('Only admins can upload private assets');
        }

        if (!body.key || !body.uploadId) {
            throw new BadRequestException('Missing required fields: key, uploadId');
        }

        await this.storageService.completeMultipartUpload(body.key, body.uploadId);
        return { key: body.key };
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('abort-multipart')
    async abortMultipart(@Request() req, @Body() body: { key: string, uploadId: string }) {
        const isAdmin = req.user.isAdmin;
        if (!isAdmin && !body.key.startsWith('public/')) {
            throw new ForbiddenException('Only admins can upload private assets');
        }

        if (!body.key || !body.uploadId) {
            throw new BadRequestException('Missing required fields: key, uploadId');
        }

        await this.storageService.abortMultipartUpload(body.key, body.uploadId);
        return { success: true };
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('generate-download')
    async generateDownloadLink(@Request() req, @Body() body: { productId: string }) {
        const userId = req.user.userId;
        const isAdmin = req.user.isAdmin;
        const productId = body.productId;
        let fileKey: string;
        let product: any;

        if (isAdmin) {
            product = await this.productsService.findOne(productId);
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

            product = item.product;
            fileKey = item.product.fileKey;
        }

        if (!fileKey) {
            throw new NotFoundException('Asset file key is missing for this product.');
        }

        // Check if user has downloaded this product before logging the current download
        const hasDownloadedBefore = await this.downloadsService.hasDownloadedBefore(userId, productId);

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

        // Send feedback reminder email if first time downloading this asset pack
        if (!hasDownloadedBefore) {
            try {
                const fullUser = await this.usersService.findOne(userId);
                if (fullUser) {
                    await this.emailService.sendFeedbackReminderEmail(
                        fullUser.email,
                        fullUser.name || 'Creative',
                        product.title
                    );
                }
            } catch (err) {
                console.error(`Failed to send feedback email: ${err.message}`);
            }
        }

        return { downloadUrl: signedUrl, expiresAt: new Date(Date.now() + 600 * 1000) };
    }
}
