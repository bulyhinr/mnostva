import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { Logger } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import {
    getWelcomeTemplate,
    getOrderConfirmationTemplate,
    getPasswordResetTemplate,
    getFeedbackReminderTemplate,
    getPaymentReminderTemplate,
    getBroadcastTemplate
} from './templates';

jest.mock('resend');

describe('EmailService', () => {
    let service: EmailService;
    let configService: Partial<ConfigService>;
    let mockedResend: jest.Mocked<Resend>;

    beforeEach(async () => {
        configService = {
            get: jest.fn().mockImplementation((key: string) => {
                if (key === 'RESEND_API_KEY') return 'test_api_key';
                return null;
            }),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EmailService,
                { provide: ConfigService, useValue: configService },
                { provide: getRepositoryToken(User), useValue: { find: jest.fn(), findOne: jest.fn() } },
                { provide: getRepositoryToken(Product), useValue: { findOne: jest.fn() } },
            ],
        }).compile();

        service = module.get<EmailService>(EmailService);
        mockedResend = (service as any).resend as jest.Mocked<Resend>;

        // Supress logger output during tests
        jest.spyOn(Logger.prototype, 'log').mockImplementation(() => { });
        jest.spyOn(Logger.prototype, 'error').mockImplementation(() => { });
        jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('initialization', () => {
        it('should warn if API key is not defined', async () => {
            const emptyConfigService = {
                get: jest.fn().mockReturnValue(undefined),
            };

            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    EmailService,
                    { provide: ConfigService, useValue: emptyConfigService },
                    { provide: getRepositoryToken(User), useValue: { find: jest.fn(), findOne: jest.fn() } },
                    { provide: getRepositoryToken(Product), useValue: { findOne: jest.fn() } },
                ],
            }).compile();

            const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
            const emptyService = module.get<EmailService>(EmailService);
            expect(warnSpy).toHaveBeenCalledWith('RESEND_API_KEY is not defined. Emails will NOT be sent.');
            expect((emptyService as any).resend).toBeUndefined();
        });
    });

    describe('sendWelcomeEmail', () => {
        it('should send welcome email successfully', async () => {
            const sendMock = jest.fn().mockResolvedValue({ data: { id: 'mock-id' }, error: null });
            mockedResend.emails = { send: sendMock } as any;

            await service.sendWelcomeEmail('test@test.com', 'Test User');

            expect(sendMock).toHaveBeenCalled();
            expect(Logger.prototype.log).toHaveBeenCalledWith('Welcome email sent to test@test.com, id: mock-id');
        });

        it('should log error if resend API returns error object', async () => {
            const sendMock = jest.fn().mockResolvedValue({ data: null, error: { message: 'Failed API' } });
            mockedResend.emails = { send: sendMock } as any;

            await service.sendWelcomeEmail('test@test.com', 'Test User');

            expect(Logger.prototype.error).toHaveBeenCalledWith('Resend API Error (welcome email to test@test.com):', { message: 'Failed API' });
        });

        it('should catch exceptions and log error', async () => {
            const sendMock = jest.fn().mockRejectedValue(new Error('Network Error'));
            mockedResend.emails = { send: sendMock } as any;

            await service.sendWelcomeEmail('test@test.com', 'Test User');

            expect(Logger.prototype.error).toHaveBeenCalledWith('Failed to send welcome email to test@test.com', expect.any(Error));
        });

        it('should handle undefined resend instance gracefully', async () => {
            (service as any).resend = undefined;
            await service.sendWelcomeEmail('test@test.com', 'Test User');
            // Shouldn't throw
        });
    });

    describe('sendOrderConfirmation', () => {
        const mockOrder = {
            id: 'ord-123456789',
            items: [],
            total: 0,
        };

        it('should send order confirmation successfully', async () => {
            const sendMock = jest.fn().mockResolvedValue({ data: { id: 'mock-id' }, error: null });
            mockedResend.emails = { send: sendMock } as any;

            await service.sendOrderConfirmation('test@test.com', mockOrder);

            expect(sendMock).toHaveBeenCalled();
            expect(Logger.prototype.log).toHaveBeenCalledWith('Order confirmation email sent to test@test.com, id: mock-id');
        });

        it('should log error if resend API returns error object', async () => {
            const sendMock = jest.fn().mockResolvedValue({ data: null, error: { message: 'Failed API' } });
            mockedResend.emails = { send: sendMock } as any;

            await service.sendOrderConfirmation('test@test.com', mockOrder);

            expect(Logger.prototype.error).toHaveBeenCalledWith('Resend API Error (order email to test@test.com):', { message: 'Failed API' });
        });

        it('should catch exceptions and log error', async () => {
            const sendMock = jest.fn().mockRejectedValue(new Error('Network Error'));
            mockedResend.emails = { send: sendMock } as any;

            await service.sendOrderConfirmation('test@test.com', mockOrder);

            expect(Logger.prototype.error).toHaveBeenCalledWith('Failed to send order email to test@test.com', expect.any(Error));
        });

        it('should handle undefined resend instance gracefully', async () => {
            (service as any).resend = undefined;
            await service.sendOrderConfirmation('test@test.com', mockOrder);
            // Shouldn't throw
        });
    });

    describe('Email Templates & Localhost Sanitization', () => {
        it('getWelcomeTemplate should replace localhost with https://mnostva.art', () => {
            const html = getWelcomeTemplate('Alex', 'http://localhost:3002');
            expect(html).not.toContain('localhost');
            expect(html).not.toContain('127.0.0.1');
            expect(html).toContain('href="https://mnostva.art/marketplace"');
        });

        it('getOrderConfirmationTemplate should replace localhost with https://mnostva.art', () => {
            const html = getOrderConfirmationTemplate({ id: 'ord-12345678', items: [], totalAmount: 1000 }, 'http://localhost:3000');
            expect(html).not.toContain('localhost');
            expect(html).not.toContain('127.0.0.1');
            expect(html).toContain('href="https://mnostva.art/profile?tab=purchases"');
        });

        it('getPasswordResetTemplate should replace localhost with https://mnostva.art', () => {
            const html = getPasswordResetTemplate('secret-token', 'http://localhost:5173');
            expect(html).not.toContain('localhost');
            expect(html).not.toContain('127.0.0.1');
            expect(html).toContain('href="https://mnostva.art/login?reset_token=secret-token"');
        });

        it('getFeedbackReminderTemplate should replace localhost with https://mnostva.art', () => {
            const html = getFeedbackReminderTemplate('Alex', 'Sci-Fi Pack', 'http://localhost:3002');
            expect(html).not.toContain('localhost');
            expect(html).not.toContain('127.0.0.1');
            expect(html).toContain('href="https://mnostva.art/profile?tab=purchases"');
        });

        it('getPaymentReminderTemplate should replace localhost with https://mnostva.art', () => {
            const html = getPaymentReminderTemplate('Alex', { items: [], totalAmount: 2000 }, 'http://localhost:3002');
            expect(html).not.toContain('localhost');
            expect(html).not.toContain('127.0.0.1');
            expect(html).toContain('href="https://mnostva.art/profile"');
        });

        it('getBroadcastTemplate should sanitize localhost in CTA link, image and body', () => {
            const html = getBroadcastTemplate({
                subject: 'Big Sale',
                body: 'Visit our site at http://localhost:3002 for more info!',
                imageUrl: 'http://localhost:3002/banner.jpg',
                ctaText: 'Shop Now',
                ctaLink: 'http://localhost:3002/marketplace',
                featuredProduct: {
                    name: 'Test Pack',
                    category: 'Props',
                    price: 1500,
                    imageUrl: 'http://localhost:3001/api/storage/public/test.jpg',
                    frontendUrl: 'http://localhost:3002/product/prod-1'
                },
                templateType: 'promo'
            });

            expect(html).not.toContain('localhost');
            expect(html).not.toContain('127.0.0.1');
            expect(html).toContain('href="https://mnostva.art/marketplace"');
            expect(html).toContain('href="https://mnostva.art/product/prod-1"');
            expect(html).toContain('src="https://mnostva.art/banner.jpg"');
            expect(html).toContain('src="https://mnostva.art/api/storage/public/test.jpg"');
            expect(html).toContain('Visit our site at https://mnostva.art for more info!');
        });
    });
});
