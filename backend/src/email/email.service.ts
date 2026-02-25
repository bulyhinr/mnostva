import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { getWelcomeTemplate, getOrderConfirmationTemplate } from './templates';

@Injectable()
export class EmailService {
    private resend: Resend;
    private readonly logger = new Logger(EmailService.name);
    private readonly FROM_EMAIL = 'onboarding@resend.dev'; // Default testing domain that works without DNS setup

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('RESEND_API_KEY');
        if (!apiKey) {
            this.logger.warn('RESEND_API_KEY is not defined. Emails will NOT be sent.');
        } else {
            this.resend = new Resend(apiKey);
        }
    }

    async sendWelcomeEmail(email: string, name: string) {
        if (!this.resend) return;

        try {
            const { data, error } = await this.resend.emails.send({
                from: this.FROM_EMAIL,
                to: [email],
                subject: 'Welcome to Mnostva! 🎨',
                html: getWelcomeTemplate(name),
            });

            if (error) {
                this.logger.error(`Resend API Error (welcome email to ${email}):`, error);
                return;
            }
            this.logger.log(`Welcome email sent to ${email}, id: ${data?.id}`);
        } catch (error) {
            this.logger.error(`Failed to send welcome email to ${email}`, error);
        }
    }

    async sendOrderConfirmation(email: string, order: any) {
        if (!this.resend) return;

        try {
            const { data, error } = await this.resend.emails.send({
                from: this.FROM_EMAIL,
                to: [email],
                subject: `Order #${order.id.slice(0, 8)} Confirmed! 🎉`,
                html: getOrderConfirmationTemplate(order),
            });

            if (error) {
                this.logger.error(`Resend API Error (order email to ${email}):`, error);
                return;
            }
            this.logger.log(`Order confirmation email sent to ${email}, id: ${data?.id}`);
        } catch (error) {
            this.logger.error(`Failed to send order email to ${email}`, error);
        }
    }
}
