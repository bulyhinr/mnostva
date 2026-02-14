import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../auth/admin.guard';
import { Product } from './entities/product.entity';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Get()
    async findAll(@Query() query: { page?: number; limit?: number; category?: string; sortBy?: string }) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const [products, total] = await this.productsService.findAll({
            page,
            limit,
            category: query.category,
            sortBy: query.sortBy,
        });
        return { data: products, total, page, limit };
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.productsService.findOne(id);
    }

    @UseGuards(AuthGuard('jwt'), AdminGuard)
    @Post()
    async create(@Body() createProductDto: CreateProductDto) {
        return this.productsService.create(createProductDto);
    }

    @UseGuards(AuthGuard('jwt'), AdminGuard)
    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
        return this.productsService.update(id, updateProductDto);
    }

    @UseGuards(AuthGuard('jwt'), AdminGuard)
    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.productsService.remove(id);
    }
}
