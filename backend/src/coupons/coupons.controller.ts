import { Controller, Get, Post, Body, Param, UseGuards, Patch } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../auth/admin.guard';

@Controller('coupons')
export class CouponsController {
    constructor(private readonly couponsService: CouponsService) { }

    @UseGuards(AuthGuard('jwt'), AdminGuard)
    @Post()
    create(@Body() body: { code: string; discountPercentage: number; maxUses?: number }) {
        return this.couponsService.create(body);
    }

    @UseGuards(AuthGuard('jwt'), AdminGuard)
    @Get()
    findAll() {
        return this.couponsService.findAll();
    }

    @UseGuards(AuthGuard('jwt'), AdminGuard)
    @Patch(':id/toggle')
    toggleActive(@Param('id') id: string) {
        return this.couponsService.toggleActive(id);
    }

    @Get('validate/:code')
    validate(@Param('code') code: string) {
        return this.couponsService.validate(code);
    }
}
