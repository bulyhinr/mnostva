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
                { provide: EmailService, useValue: { sendWelcomeEmail: jest.fn() } },
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
});
