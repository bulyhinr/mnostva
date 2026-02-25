import { Test } from '@nestjs/testing';
import { CouponsModule } from './coupons.module';
import { CouponsService } from './coupons.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Coupon } from './entities/coupon.entity';

describe('CouponsModule', () => {
    it('should compile the module', async () => {
        const module = await Test.createTestingModule({
            imports: [CouponsModule],
        })
            .overrideProvider(getRepositoryToken(Coupon))
            .useValue({})
            .compile();

        expect(module).toBeDefined();
        expect(module.get(CouponsService)).toBeInstanceOf(CouponsService);
    });
});
