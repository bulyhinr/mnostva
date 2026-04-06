import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { EmailService } from '../email/email.service';

jest.mock('bcrypt');

describe('AuthService', () => {
    let service: AuthService;
    let usersService: Partial<UsersService>;
    let jwtService: Partial<JwtService>;

    beforeEach(async () => {
        usersService = {
            findByEmail: jest.fn(),
            findByResetToken: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
        };

        jwtService = {
            sign: jest.fn().mockReturnValue('mock-token'),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UsersService, useValue: usersService },
                { provide: JwtService, useValue: jwtService },
                { provide: EmailService, useValue: { sendWelcomeEmail: jest.fn(), sendPasswordResetEmail: jest.fn() } },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('login', () => {
        it('should return token if valid credentials', async () => {
            const loginDto = { email: 'test@example.com', password: 'password' };
            const user = {
                id: '1',
                email: 'test@example.com',
                passwordHash: '$2b$10$hashed_password', // mock hash
                name: 'Test',
                bio: 'Bio',
                isAdmin: false
            };

            (usersService.findByEmail as jest.Mock).mockResolvedValue(user);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await service.login(loginDto);
            expect(result.accessToken).toBe('mock-token');
            expect(result.user.bio).toBe('Bio');
        });

        it('should throw Unauthorized if invalid password', async () => {
            const loginDto = { email: 'test@example.com', password: 'wrong' };
            const user = { id: '1', email: 'test@example.com', passwordHash: 'hash' };

            (usersService.findByEmail as jest.Mock).mockResolvedValue(user);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('register', () => {
        it('should create new user', async () => {
            const registerDto = { email: 'new@test.com', password: 'pass', name: 'New' };
            (usersService.findByEmail as jest.Mock).mockResolvedValue(null);

            const createdUser = { id: '2', ...registerDto, passwordHash: 'hash', isAdmin: false };
            (usersService.create as jest.Mock).mockResolvedValue(createdUser);

            (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
            (bcrypt.hash as jest.Mock).mockResolvedValue('hash');

            const result = await service.register(registerDto);
            expect(result.accessToken).toBe('mock-token');
            expect(usersService.create).toHaveBeenCalled();
        });

        it('should throw Conflict if email exists', async () => {
            const registerDto = { email: 'exist@test.com', password: 'pass', name: 'Exist' };
            (usersService.findByEmail as jest.Mock).mockResolvedValue({ id: '1' });

            await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
        });
    });

    describe('forgotPassword', () => {
        it('should send reset email and save token if user exists', async () => {
            const dto = { email: 'test@example.com' };
            const user = { id: '1', email: 'test@example.com', resetToken: null, resetTokenExpiry: null };
            (usersService.findByEmail as jest.Mock).mockResolvedValue(user);

            const result = await service.forgotPassword(dto);

            expect(usersService.save).toHaveBeenCalled();
            expect(user.resetToken).toBeDefined();
            expect(user.resetTokenExpiry).toBeDefined();
            expect(result.message).toContain('reset link has been sent');
        });

        it('should return success message even if user does not exist', async () => {
            const dto = { email: 'unknown@example.com' };
            (usersService.findByEmail as jest.Mock).mockResolvedValue(null);

            const result = await service.forgotPassword(dto);

            expect(usersService.save).not.toHaveBeenCalled();
            expect(result.message).toContain('reset link has been sent');
        });
    });

    describe('resetPassword', () => {
        it('should reset password and clear token if valid token', async () => {
            const dto = { token: 'valid-token', newPassword: 'newpass' };
            const futureDate = new Date(Date.now() + 1000000);
            const user = { id: '1', resetToken: 'valid-token', resetTokenExpiry: futureDate, passwordHash: 'oldHash' };
            (usersService.findByResetToken as jest.Mock).mockResolvedValue(user);
            (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
            (bcrypt.hash as jest.Mock).mockResolvedValue('newHash');

            const result = await service.resetPassword(dto);

            expect(usersService.save).toHaveBeenCalled();
            expect(user.resetToken).toBeNull();
            expect(user.resetTokenExpiry).toBeNull();
            expect(user.passwordHash).toBe('newHash');
            expect(result.message).toBe('Password has been reset successfully');
        });

        it('should throw Unauthorized if token is invalid or expired', async () => {
            const dto = { token: 'invalid', newPassword: 'newpass' };
            (usersService.findByResetToken as jest.Mock).mockResolvedValue(null);

            await expect(service.resetPassword(dto)).rejects.toThrow(UnauthorizedException);

            // test expired
            const pastDate = new Date(Date.now() - 1000000);
            (usersService.findByResetToken as jest.Mock).mockResolvedValue({ id: '1', resetTokenExpiry: pastDate });
            await expect(service.resetPassword(dto)).rejects.toThrow(UnauthorizedException);
        });
    });
});

