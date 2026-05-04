import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
    let controller: AuthController;
    let service: any;

    beforeEach(async () => {
        service = {
            login: jest.fn(),
            register: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: service,
                },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
    });

    describe('login', () => {
        it('should call AuthService.login', async () => {
            const dto = { email: 't@t.com', password: 'p' };
            service.login.mockResolvedValue('token');
            expect(await controller.login(dto)).toBe('token');
            expect(service.login).toHaveBeenCalledWith(dto);
        });
    });

    describe('register', () => {
        it('should call AuthService.register', async () => {
            const dto = { email: 't@t.com', password: 'p', name: 'N', acceptedTerms: true };
            service.register.mockResolvedValue('token');
            expect(await controller.register(dto)).toBe('token');
            expect(service.register).toHaveBeenCalledWith(dto);
        });
    });

    describe('forgotPassword', () => {
        it('should call AuthService.forgotPassword', async () => {
            const dto = { email: 't@t.com' };
            service.forgotPassword = jest.fn().mockResolvedValue({ message: 'sent' });
            expect(await controller.forgotPassword(dto)).toEqual({ message: 'sent' });
            expect(service.forgotPassword).toHaveBeenCalledWith(dto);
        });
    });

    describe('resetPassword', () => {
        it('should call AuthService.resetPassword', async () => {
            const dto = { token: 't', newPassword: 'p' };
            service.resetPassword = jest.fn().mockResolvedValue({ message: 'done' });
            expect(await controller.resetPassword(dto)).toEqual({ message: 'done' });
            expect(service.resetPassword).toHaveBeenCalledWith(dto);
        });
    });
});
