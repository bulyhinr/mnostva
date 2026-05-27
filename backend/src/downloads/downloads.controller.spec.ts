import { Test, TestingModule } from '@nestjs/testing';
import { DownloadsController } from './downloads.controller';
import { DownloadsService } from './downloads.service';
import { OrdersService } from '../orders/orders.service';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { UnauthorizedException } from '@nestjs/common';

describe('DownloadsController', () => {
    let controller: DownloadsController;
    let downloadsService: jest.Mocked<Partial<DownloadsService>>;
    let ordersService: jest.Mocked<Partial<OrdersService>>;
    let productsService: jest.Mocked<Partial<ProductsService>>;
    let usersService: jest.Mocked<Partial<UsersService>>;
    let emailService: jest.Mocked<Partial<EmailService>>;

    beforeEach(async () => {
        downloadsService = {
            generateSignedUrl: jest.fn(),
            logDownload: jest.fn(),
            hasDownloadedBefore: jest.fn(),
        };

        ordersService = {
            // Add methods if used
        };

        productsService = {
            findOne: jest.fn(),
        };

        usersService = {
            findOne: jest.fn(),
        };

        emailService = {
            sendFeedbackReminderEmail: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [DownloadsController],
            providers: [
                { provide: DownloadsService, useValue: downloadsService },
                { provide: OrdersService, useValue: ordersService },
                { provide: ProductsService, useValue: productsService },
                { provide: UsersService, useValue: usersService },
                { provide: EmailService, useValue: emailService },
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

    it('should generate download link, log, and send email on first download', async () => {
        productsService.findOne.mockResolvedValue({ title: 'Test Pack', fileKey: 'test.zip' } as any);
        downloadsService.generateSignedUrl.mockResolvedValue('url');
        downloadsService.logDownload.mockResolvedValue({} as any);
        downloadsService.hasDownloadedBefore.mockResolvedValue(false);
        usersService.findOne.mockResolvedValue({ email: 'user@example.com', name: 'John Doe' } as any);
        emailService.sendFeedbackReminderEmail.mockResolvedValue(undefined);

        const req = { user: { userId: 'user-1' }, ip: '127.0.0.1', headers: { 'user-agent': 'agent' } };
        const result = await controller.generateDownloadLink(req, '123');

        expect(result).toHaveProperty('downloadUrl', 'url');
        expect(result).toHaveProperty('expiresAt');
        expect(downloadsService.hasDownloadedBefore).toHaveBeenCalledWith('user-1', '123');
        expect(downloadsService.generateSignedUrl).toHaveBeenCalledWith('test.zip');
        expect(downloadsService.logDownload).toHaveBeenCalledWith({
            user: { id: 'user-1' },
            product: { id: '123' },
            ipAddress: '127.0.0.1',
            userAgent: 'agent',
        });
        expect(usersService.findOne).toHaveBeenCalledWith('user-1');
        expect(emailService.sendFeedbackReminderEmail).toHaveBeenCalledWith(
            'user@example.com',
            'John Doe',
            'Test Pack'
        );
    });

    it('should NOT send email if product has been downloaded before', async () => {
        productsService.findOne.mockResolvedValue({ title: 'Test Pack', fileKey: 'test.zip' } as any);
        downloadsService.generateSignedUrl.mockResolvedValue('url');
        downloadsService.logDownload.mockResolvedValue({} as any);
        downloadsService.hasDownloadedBefore.mockResolvedValue(true);

        const req = { user: { userId: 'user-1' }, ip: '127.0.0.1', headers: { 'user-agent': 'agent' } };
        const result = await controller.generateDownloadLink(req, '123');

        expect(result).toHaveProperty('downloadUrl', 'url');
        expect(downloadsService.hasDownloadedBefore).toHaveBeenCalledWith('user-1', '123');
        expect(downloadsService.logDownload).toHaveBeenCalled();
        expect(usersService.findOne).not.toHaveBeenCalled();
        expect(emailService.sendFeedbackReminderEmail).not.toHaveBeenCalled();
    });

    it('should still generate link and log if email service fails', async () => {
        productsService.findOne.mockResolvedValue({ title: 'Test Pack', fileKey: 'test.zip' } as any);
        downloadsService.generateSignedUrl.mockResolvedValue('url');
        downloadsService.logDownload.mockResolvedValue({} as any);
        downloadsService.hasDownloadedBefore.mockResolvedValue(false);
        usersService.findOne.mockResolvedValue({ email: 'user@example.com', name: 'John Doe' } as any);
        emailService.sendFeedbackReminderEmail.mockRejectedValue(new Error('SMTP error'));

        const req = { user: { userId: 'user-1' }, ip: '127.0.0.1', headers: { 'user-agent': 'agent' } };
        const result = await controller.generateDownloadLink(req, '123');

        expect(result).toHaveProperty('downloadUrl', 'url');
        expect(downloadsService.logDownload).toHaveBeenCalled();
        expect(emailService.sendFeedbackReminderEmail).toHaveBeenCalled();
        // Succeeded without throwing because of internal try/catch in controller
    });
});
