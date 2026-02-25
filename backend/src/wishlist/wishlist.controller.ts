import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WishlistService } from './wishlist.service';

@Controller('wishlist')
export class WishlistController {
    constructor(private readonly wishlistService: WishlistService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post(':productId/toggle')
    async toggle(@Request() req, @Param('productId') productId: string) {
        return this.wishlistService.toggle(req.user.userId, productId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    async findAll(@Request() req) {
        return this.wishlistService.getWishlist(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':productId/check')
    async checkStatus(@Request() req, @Param('productId') productId: string) {
        return { inWishlist: await this.wishlistService.checkStatus(req.user.userId, productId) };
    }
}
