import { Controller, Post, Body, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    async create(@Request() req, @Body() createReviewDto: CreateReviewDto) {
        return this.reviewsService.create(req.user.userId, createReviewDto);
    }

    @Get('product/:productId')
    async findAll(@Param('productId') productId: string) {
        return this.reviewsService.findAllByProduct(productId);
    }

    @Get('product/:productId/stats')
    async getStats(@Param('productId') productId: string) {
        return this.reviewsService.getAverageRating(productId);
    }
}
