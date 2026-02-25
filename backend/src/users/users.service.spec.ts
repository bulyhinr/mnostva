import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
    let service: UsersService;
    let repoMock: any;

    beforeEach(async () => {
        repoMock = {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getRepositoryToken(User),
                    useValue: repoMock,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findByEmail', () => {
        it('should find user by email', async () => {
            const email = 'test@example.com';
            const user = { id: '1', email };
            repoMock.findOne.mockResolvedValue(user);

            expect(await service.findByEmail(email)).toEqual(user);
            expect(repoMock.findOne).toHaveBeenCalledWith({ where: { email } });
        });
    });

    describe('update', () => {
        it('should update user fields', async () => {
            const id = '1';
            const existingUser = { id, name: 'Old', email: 'old@test.com' };
            const updateData = { name: 'New' };

            repoMock.findOne.mockResolvedValue(existingUser);
            repoMock.save.mockImplementation((u) => Promise.resolve(u));

            const result = await service.update(id, updateData);

            expect(result.name).toBe('New');
            expect(repoMock.save).toHaveBeenCalled();
        });

        it('should hash password if provided', async () => {
            const id = '1';
            const existingUser = { id, passwordHash: 'oldhash' };
            const updateData = { password: 'newpassword' };

            repoMock.findOne.mockResolvedValue(existingUser);
            repoMock.save.mockImplementation((u) => Promise.resolve(u));

            // Mock bcrypt
            (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
            (bcrypt.hash as jest.Mock).mockResolvedValue('newhash');

            const result = await service.update(id, updateData);

            expect(result.passwordHash).toBe('newhash');
        });

        it('should throw error if user not found', async () => {
            repoMock.findOne.mockResolvedValue(null);
            await expect(service.update('999', {})).rejects.toThrow('User not found');
        });
    });
});
