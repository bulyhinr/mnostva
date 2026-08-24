import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { getWelcomeTemplate, getOrderConfirmationTemplate, getPasswordResetTemplate, getFeedbackReminderTemplate, getPaymentReminderTemplate, getBroadcastTemplate, getAdminPurchaseAlertTemplate, getAdminReviewAlertTemplate } from './templates';

@Injectable()
export class EmailService {
    private resend: Resend;
    private readonly logger = new Logger(EmailService.name);
    private readonly FROM_EMAIL: string;
    private readonly FRONTEND_URL: string;

    constructor(
        private configService: ConfigService,
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        @InjectRepository(Product)
        private readonly productsRepository: Repository<Product>,
    ) {
        const apiKey = this.configService.get<string>('RESEND_API_KEY');
        if (!apiKey) {
            this.logger.warn('RESEND_API_KEY is not defined. Emails will NOT be sent.');
        } else {
            this.resend = new Resend(apiKey);
        }
        this.FROM_EMAIL = this.configService.get<string>('RESEND_FROM_EMAIL') || 'onboarding@resend.dev';
        this.FRONTEND_URL = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    }

    private getFrontendUrl(): string {
        const url = this.FRONTEND_URL;
        if (url.includes('localhost:3000') || url.includes('localhost:5173')) {
            return 'http://localhost:3002';
        }
        return url;
    }

    async sendWelcomeEmail(email: string, name: string) {
        if (!this.resend) return;

        try {
            const { data, error } = await this.resend.emails.send({
                from: this.FROM_EMAIL,
                to: [email],
                subject: 'Welcome to Mnostva! 🎨',
                html: getWelcomeTemplate(name, this.getFrontendUrl()),
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
                html: getOrderConfirmationTemplate(order, this.getFrontendUrl()),
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
                html: getPasswordResetTemplate(token, this.getFrontendUrl()),
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

    async sendPaymentReminderEmail(email: string, name: string, order: any) {
        if (!this.resend) return;

        try {
            const { data, error } = await this.resend.emails.send({
                from: this.FROM_EMAIL,
                to: [email],
                subject: 'Complete Your Order - Mnostva Art 🎨',
                html: getPaymentReminderTemplate(name, order, this.getFrontendUrl()),
            });

            if (error) {
                this.logger.error(`Resend API Error (payment reminder email to ${email}):`, error);
                return;
            }
            this.logger.log(`Payment reminder email sent to ${email}, id: ${data?.id}`);
        } catch (error) {
            this.logger.error(`Failed to send payment reminder email to ${email}`, error);
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

    async sendAdminPurchaseAlert(order: any) {
        if (!this.resend) return;

        const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'mnostva@gmail.com';
        try {
            const { data, error } = await this.resend.emails.send({
                from: this.FROM_EMAIL,
                to: [adminEmail],
                subject: `🔔 New Purchase Alert - Order #${order.id?.slice(0, 8) || 'N/A'}!`,
                html: getAdminPurchaseAlertTemplate(order),
            });

            if (error) {
                this.logger.error(`Resend API Error (admin purchase alert):`, error);
                return;
            }
            this.logger.log(`Admin purchase alert email sent to ${adminEmail}, id: ${data?.id}`);
        } catch (error) {
            this.logger.error(`Failed to send admin purchase alert email`, error);
        }
    }

    async sendAdminReviewAlert(review: any, productTitle: string, userEmail: string) {
        if (!this.resend) return;

        const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'mnostva@gmail.com';
        try {
            const { data, error } = await this.resend.emails.send({
                from: this.FROM_EMAIL,
                to: [adminEmail],
                subject: `🔔 New Product Review Alert! ⭐`,
                html: getAdminReviewAlertTemplate(review, productTitle, userEmail),
            });

            if (error) {
                this.logger.error(`Resend API Error (admin review alert):`, error);
                return;
            }
            this.logger.log(`Admin review alert email sent to ${adminEmail}, id: ${data?.id}`);
        } catch (error) {
            this.logger.error(`Failed to send admin review alert email`, error);
        }
    }

    async sendFeedbackReminderEmail(email: string, name: string, productName: string) {
        if (!this.resend) return;

        try {
            const { data, error } = await this.resend.emails.send({
                from: this.FROM_EMAIL,
                to: [email],
                subject: `Enjoying your download: ${productName}? 📦`,
                html: getFeedbackReminderTemplate(name, productName, this.getFrontendUrl()),
            });

            if (error) {
                this.logger.error(`Resend API Error (feedback reminder email to ${email}):`, error);
                return;
            }
            this.logger.log(`Feedback reminder email sent to ${email}, id: ${data?.id}`);
        } catch (error) {
            this.logger.error(`Failed to send feedback reminder email to ${email}`, error);
        }
    }

    async sendBroadcastNewsletter(
        body: {
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
        adminUser: any
    ) {
        if (!this.resend) {
            return { success: false, message: 'Resend API key is not configured' };
        }

        // 1. Resolve featured product details if provided
        let featuredProductData: {
            name: string;
            category: string;
            price: number;
            originalPrice?: number;
            discountPercentage?: number;
            imageUrl: string;
            frontendUrl: string;
        } | undefined = undefined;

        if (body.featuredProductId) {
            const product = await this.productsRepository.findOne({ where: { id: body.featuredProductId } });
            if (product) {
                const r2PublicUrl = this.configService.get<string>('R2_PUBLIC_URL');
                const imageUrl = product.previewImageKey
                    ? (r2PublicUrl && product.previewImageKey.startsWith('public/')
                        ? `${r2PublicUrl}/${product.previewImageKey}`
                        : `${this.getFrontendUrl().replace(':3002', ':3001')}/api/storage/public/${product.previewImageKey}`)
                    : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800';

                // Check active discount
                let originalPrice: number | undefined = undefined;
                let discountPercentage: number | undefined = undefined;
                
                const fullProduct = await this.productsRepository.findOne({ 
                    where: { id: body.featuredProductId },
                    relations: ['discount'] 
                });
                
                if (fullProduct && fullProduct.discount && fullProduct.discount.isActive) {
                    originalPrice = fullProduct.price;
                    discountPercentage = fullProduct.discount.percentage;
                }

                featuredProductData = {
                    name: product.title,
                    category: product.category,
                    price: fullProduct && fullProduct.discount && fullProduct.discount.isActive 
                        ? Math.round(product.price * (1 - fullProduct.discount.percentage / 100))
                        : product.price,
                    originalPrice,
                    discountPercentage,
                    imageUrl,
                    frontendUrl: `${this.getFrontendUrl()}/product/${product.id}`
                };
            }
        }

        // 2. Generate HTML layout
        const templateHtml = getBroadcastTemplate({
            subject: body.subject,
            body: body.body,
            imageUrl: body.imageUrl,
            featuredProduct: featuredProductData,
            ctaText: body.ctaText,
            ctaLink: body.ctaLink,
            templateType: body.templateType
        });

        // 3. Determine recipients
        let recipients: string[] = [];
        if (body.testEmailOnly) {
            recipients = [body.testRecipient || adminUser.email];
            this.logger.log(`Triggering test broadcast newsletter email to ${recipients[0]}`);
        } else {
            const allUsers = await this.usersRepository.find();
            recipients = allUsers.map(u => u.email).filter(Boolean);
            this.logger.log(`Triggering global broadcast newsletter email to ${recipients.length} users`);
        }

        if (recipients.length === 0) {
            return { success: false, message: 'No recipients found' };
        }

        // Safety limit check: prevent global broadcasts to > 100 users on the free Resend tier
        if (!body.testEmailOnly && recipients.length > 100) {
            return {
                success: false,
                message: `Broadcast aborted: You have ${recipients.length} customers, which exceeds the Resend free tier daily limit (100). Please verify your domain and upgrade your Resend account first.`
            };
        }

        // 4. Send emails sequentially with a delay to strictly avoid Resend's rate limit
        let realSentCount = 0;
        let simulatedCount = 0;
        let failCount = 0;

        const isSandbox = this.FROM_EMAIL === 'onboarding@resend.dev';
        const verifiedEmails = [
            'bulyhinr@gmail.com',
            'bulyhinroman@gmail.com',
            'bulyhinroman2@gmail.com',
            'admin@mnostva.art',
            adminUser?.email
        ].filter(Boolean).map(e => e.toLowerCase());

        for (let i = 0; i < recipients.length; i++) {
            const email = recipients[i];
            
            // Wait 200ms between emails to strictly avoid Resend's rate limit
            if (i > 0) {
                await new Promise((resolve) => setTimeout(resolve, 200));
            }

            const emailLower = email.toLowerCase();
            const isVerified = verifiedEmails.includes(emailLower);

            if (isSandbox && !isVerified) {
                // Simulate sending to mock sandbox user
                this.logger.log(`[Sandbox Mode] Simulated newsletter delivery of "${body.subject}" to mock customer: ${email}`);
                simulatedCount++;
                continue;
            }

            try {
                const { error } = await this.resend.emails.send({
                    from: this.FROM_EMAIL,
                    to: [email],
                    subject: body.subject,
                    html: templateHtml,
                });
                if (error) {
                    this.logger.error(`Failed to send newsletter to ${email}:`, error);
                    failCount++;
                } else {
                    realSentCount++;
                }
            } catch (err) {
                this.logger.error(`Exception sending newsletter to ${email}:`, err);
                failCount++;
            }
        }

        return {
            success: true,
            totalRecipients: recipients.length,
            sentCount: realSentCount + simulatedCount, // Backward compatibility: total successfully processed
            realSentCount,
            simulatedCount,
            failCount
        };
    }
}
