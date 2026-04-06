import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { User } from '../users/entities/user.entity';

import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private emailService: EmailService,
    ) { }

    async register(registerDto: RegisterDto): Promise<any> {
        const email = registerDto.email.toLowerCase();
        const existingUser = await this.usersService.findByEmail(email);
        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(registerDto.password, salt);

        const newUser = await this.usersService.create({
            ...registerDto,
            email,
            passwordHash,
        });

        // Send welcome email
        this.emailService.sendWelcomeEmail(newUser.email, newUser.name);

        return this.generateTokens(newUser);
    }

    async login(loginDto: LoginDto): Promise<any> {
        const user = await this.usersService.findByEmail(loginDto.email.toLowerCase());
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(loginDto.password, user.passwordHash);
        if (!isMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return this.generateTokens(user);
    }

    async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
        const user = await this.usersService.findByEmail(dto.email.toLowerCase());
        if (!user) {
            return { message: 'If an account with this email exists, a reset link has been sent.' };
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        user.resetToken = resetToken;
        user.resetTokenExpiry = resetTokenExpiry;
        await this.usersService.save(user);

        await this.emailService.sendPasswordResetEmail(user.email, resetToken);

        return { message: 'If an account with this email exists, a reset link has been sent.' };
    }

    async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
        const user = await this.usersService.findByResetToken(dto.token);
        
        if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
            throw new UnauthorizedException('Invalid or expired reset token');
        }

        const salt = await bcrypt.genSalt();
        user.passwordHash = await bcrypt.hash(dto.newPassword, salt);
        user.resetToken = null;
        user.resetTokenExpiry = null;

        await this.usersService.save(user);

        return { message: 'Password has been reset successfully' };
    }

    private async generateTokens(user: User) {
        const payload = { sub: user.id, email: user.email, isAdmin: user.isAdmin };
        const accessToken = this.jwtService.sign(payload);

        // Refresh token logic would go here

        return {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                avatar: user.avatar,
                bio: user.bio,
                isAdmin: user.isAdmin,
            },
        };
    }
}
