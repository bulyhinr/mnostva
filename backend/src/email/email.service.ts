import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { getWelcomeTemplate, getOrderConfirmationTemplate, getPasswordResetTemplate } from './templates';

@Injectable()
export class EmailService {
    private resend: Resend;
    private readonly logger = new Logger(EmailService.name);
    private readonly FROM_EMAIL: string;
    private readonly FRONTEND_URL: string;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('RESEND_API_KEY');
        if (!apiKey) {
            this.logger.warn('RESEND_API_KEY is not defined. Emails will NOT be sent.');
        } else {
            this.resend = new Resend(apiKey);
        }
        this.FROM_EMAIL = this.configService.get<string>('RESEND_FROM_EMAIL') || 'onboarding@resend.dev';
        this.FRONTEND_URL = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    }

    async sendWelcomeEmail(email: string, name: string) {
        if (!this.resend) return;

        try {
            const { data, error } = await this.resend.emails.send({
                from: this.FROM_EMAIL,
                to: [email],
                subject: 'Welcome to Mnostva! 🎨',
                html: getWelcomeTemplate(name, this.FRONTEND_URL),
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
                html: getOrderConfirmationTemplate(order, this.FRONTEND_URL),
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

    async sendPasswordResetEmail(email: string, token: string) {
        if (!this.resend) return;

        try {
            const { data, error } = await this.resend.emails.send({
                from: this.FROM_EMAIL,
                to: [email],
                subject: 'Reset Your Password - Mnostva Art 🔐',
                html: getPasswordResetTemplate(token, this.FRONTEND_URL),
            });

            if (error) {
                this.logger.error(`Resend API Error (password reset email to ${email}):`, error);
                return;
            }
            this.logger.log(`Password reset email sent to ${email}, id: ${data?.id}`);
        } catch (error) {
            this.logger.error(`Failed to send password reset email to ${email}`, error);
        }
    }

    async sendContactEmail(data: { name: string; email: string; description: string }) {
        if (!this.resend) {
            this.logger.warn('Contact email skipped (no resend client)');
            return;
        }

        const targetEmail = process.env.FAB_EMAIL || 'support@mnostva.art';

        try {
            const { data: resp, error } = await this.resend.emails.send({
                from: this.FROM_EMAIL,
                to: [targetEmail],
                replyTo: data.email,
                subject: `New Freelance Request from ${data.name} 🚀`,
                html: `
                  <h2>New Contact Request</h2>
                  <p><strong>Name:</strong> ${data.name}</p>
                  <p><strong>Email:</strong> ${data.email}</p>
                  <p><strong>Description:</strong></p>
                  <blockquote style="background: #f9f9f9; padding: 15px; border-left: 5px solid #ccc;">
                    ${data.description.replace(/\n/g, '<br>')}
                  </blockquote>
                `,
            });

            if (error) {
                this.logger.error(`Resend API Error (contact email):`, error);
                return;
            }
            this.logger.log(`Contact email sent from ${data.email} to ${targetEmail}, id: ${resp?.id}`);
        } catch (error) {
            this.logger.error(`Failed to send contact email`, error);
        }
    }
}
