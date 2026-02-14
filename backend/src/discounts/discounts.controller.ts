import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DiscountsService } from './discounts.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../auth/admin.guard';

@Controller('discounts')
export class DiscountsController {
    constructor(private readonly discountsService: DiscountsService) { }

    @UseGuards(AuthGuard('jwt'), AdminGuard)
    @Post()
    create(@Body() createDiscountDto: CreateDiscountDto) {
        return this.discountsService.create(createDiscountDto);
    }

    @UseGuards(AuthGuard('jwt'), AdminGuard)
    @Get()
    findAll() {
        return this.discountsService.findAll();
    }

    @UseGuards(AuthGuard('jwt'), AdminGuard)
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.discountsService.findOne(id);
    }

    @UseGuards(AuthGuard('jwt'), AdminGuard)
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDiscountDto: UpdateDiscountDto) {
        return this.discountsService.update(id, updateDiscountDto);
    }

    @UseGuards(AuthGuard('jwt'), AdminGuard)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.discountsService.remove(id);
    }
}
