import { AdminGuard } from './admin.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';

describe('AdminGuard', () => {
    let guard: AdminGuard;
    let reflector: jest.Mocked<Partial<Reflector>>;

    beforeEach(() => {
        reflector = {};
        guard = new AdminGuard(reflector as unknown as Reflector);
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    it('should throw ForbiddenException if user is not defined', () => {
        const mockContext = {
            switchToHttp: () => ({
                getRequest: () => ({ user: null }),
            }),
        } as unknown as ExecutionContext;

        expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if user is not admin', () => {
        const mockContext = {
            switchToHttp: () => ({
                getRequest: () => ({ user: { isAdmin: false } }),
            }),
        } as unknown as ExecutionContext;

        expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });

    it('should return true if user is admin', () => {
        const mockContext = {
            switchToHttp: () => ({
                getRequest: () => ({ user: { isAdmin: true } }),
            }),
        } as unknown as ExecutionContext;

        expect(guard.canActivate(mockContext)).toBe(true);
    });
});
