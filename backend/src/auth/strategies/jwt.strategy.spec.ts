import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';

describe('JwtStrategy', () => {
    let strategy: JwtStrategy;
    let configService: jest.Mocked<Partial<ConfigService>>;

    beforeEach(() => {
        configService = {
            getOrThrow: jest.fn().mockReturnValue('test-secret'),
        };
        strategy = new JwtStrategy(configService as unknown as ConfigService);
    });

    it('should be defined', () => {
        expect(strategy).toBeDefined();
    });

    it('should validate and return user payload', async () => {
        const payload = { sub: '123', email: 'test@test.com', isAdmin: true };
        const result = await strategy.validate(payload);
        expect(result).toEqual({ userId: '123', email: 'test@test.com', isAdmin: true });
    });
});
