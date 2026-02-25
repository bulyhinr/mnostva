import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
    let controller: UsersController;
    let service: any;

    beforeEach(async () => {
        service = {
            update: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                {
                    provide: UsersService,
                    useValue: service,
                },
            ],
        }).compile();

        controller = module.get<UsersController>(UsersController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('updateProfile', () => {
        it('should call UsersService.update with userId and body', async () => {
            const userId = '1';
            const body = { name: 'New Name' };
            const req = { user: { userId } };
            const updatedUser = { id: userId, ...body };

            service.update.mockResolvedValue(updatedUser);

            expect(await controller.updateProfile(req, body)).toEqual(updatedUser);
            expect(service.update).toHaveBeenCalledWith(userId, body);
        });
    });
});
