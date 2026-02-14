import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService {
    private s3Client: S3Client;
    private bucketName: string;
    private publicUrl: string;
    private readonly logger = new Logger(StorageService.name);

    constructor(private configService: ConfigService) {
        this.bucketName = this.configService.get<string>('R2_BUCKET_NAME') || '';
        this.publicUrl = this.configService.get<string>('R2_PUBLIC_URL') || '';

        const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID');
        const secretAccessKey = this.configService.get<string>('R2_SECRET_ACCESS_KEY');
        const accountId = this.configService.get<string>('R2_ACCOUNT_ID');

        if (!accessKeyId || !secretAccessKey || !accountId || accessKeyId.includes('replace_me')) {
            this.logger.error('R2 Credentials missing or invalid (check .env). Storage features will fail.');
        }

        this.s3Client = new S3Client({
            region: 'auto',
            endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
            forcePathStyle: true,
            credentials: {
                accessKeyId: accessKeyId || '',
                secretAccessKey: secretAccessKey || '',
            },
        });
    }

    async generateDownloadUrl(key: string, expiresInSeconds = 600): Promise<string> {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            // Force signed URL even for public files. This ensures reliability regardless of bucket privacy settings.
            // Also fixes issues where public domain might be misconfigured or blocked.
            return await getSignedUrl(this.s3Client, command, { expiresIn: expiresInSeconds });

        } catch (error) {
            this.logger.error(`Failed to generate download URL for key: ${key}`, error);
            throw new InternalServerErrorException('Could not generate download link');
        }
    }

    async generateUploadUrl(key: string, contentType: string, expiresInSeconds = 600): Promise<string> {
        try {
            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                ContentType: contentType,
            });
            return await getSignedUrl(this.s3Client, command, { expiresIn: expiresInSeconds });
        } catch (error) {
            this.logger.error(`Failed to generate upload URL for key: ${key}`, error);
            throw new InternalServerErrorException('Could not generate upload link');
        }
    }

    getPublicUrl(key: string): string | null {
        // This method is primarily used for constructing hypothetical public URLs.
        // It does NOT validate access.
        if (this.publicUrl && key.startsWith('public/')) {
            return `${this.publicUrl}/${key}`;
        }
        return null;
    }
}
