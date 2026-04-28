import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('forgot-password')
    async forgotPassword(@Body() dto: ForgotPasswordDto) {
        return this.authService.forgotPassword(dto);
    }

    @Post('reset-password')
    async resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto);
    }

    @Post('refresh')
    async refresh(@Body('refreshToken') refreshToken: string) {
        return this.authService.refresh(refreshToken);
    }
}
