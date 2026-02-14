import { Controller, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @UseGuards(AuthGuard('jwt'))
    @Patch('profile')
    async updateProfile(@Req() req, @Body() body: { name?: string; email?: string; bio?: string; avatar?: string; password?: string }) {
        return this.usersService.update(req.user.userId, body);
    }
}
