import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { Logger } from '@nestjs/common';

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
});
