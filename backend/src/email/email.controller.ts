import { Controller, Post, Body, HttpCode } from '@nestjs/common';
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
}
