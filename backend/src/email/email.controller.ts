import { Controller, Post, Body, HttpCode, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../auth/admin.guard';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('contact')
  @HttpCode(200)
  async handleContact(@Body() body: { name: string; email: string; description: string }) {
    await this.emailService.sendContactEmail(body);
    return { success: true };
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Post('broadcast')
  @HttpCode(200)
  async handleBroadcast(
    @Body() body: { 
      subject: string; 
      body: string; 
      imageUrl?: string; 
      featuredProductId?: string; 
      ctaText?: string; 
      ctaLink?: string; 
      templateType: 'promo' | 'announcement' | 'new_release';
      testEmailOnly?: boolean;
      testRecipient?: string;
    },
    @Request() req
  ) {
    return this.emailService.sendBroadcastNewsletter(body, req.user);
  }
}
