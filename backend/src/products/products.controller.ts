import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Header } from '@nestjs/common';
import { ProductsService } from './products.service';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../auth/admin.guard';
import { Product } from './entities/product.entity';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Get()
    @Header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    @Header('Pragma', 'no-cache')
    @Header('Expires', '0')
    async findAll(@Query() query: {
        page?: number;
        limit?: number;
        category?: string;
        sortBy?: string;
        polyCount?: string;
        rigged?: string;
        animated?: string;
        textures?: string;
        search?: string;
    }) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        console.log(`Fetching products with page=${page}, limit=${limit}, category=${query.category}`);

        try {
            const [products, total] = await this.productsService.findAll({
                page: Number(page),
                limit: Number(limit),
                category: query.category,
                sortBy: query.sortBy,
                polyCount: query.polyCount,
                rigged: query.rigged,
                animated: query.animated,
                textures: query.textures,
                search: query.search,
            });
            console.log(`Found ${products.length} products, total=${total}`);
            return { data: products, total, page, limit };
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
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
