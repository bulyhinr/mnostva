import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { 
    S3Client, 
    GetObjectCommand, 
    PutObjectCommand, 
    HeadObjectCommand,
    CreateMultipartUploadCommand,
    UploadPartCommand,
    CompleteMultipartUploadCommand,
    AbortMultipartUploadCommand,
    ListPartsCommand
} from '@aws-sdk/client-s3';
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
            requestChecksumCalculation: 'WHEN_REQUIRED' as any,
            responseChecksumValidation: 'WHEN_REQUIRED' as any,
        });
    }

    async generateDownloadUrl(key: string, expiresInSeconds = 600): Promise<string> {
        try {
            // Check if file exists
            try {
                await this.s3Client.send(new HeadObjectCommand({
                    Bucket: this.bucketName,
                    Key: key,
                }));
            } catch (error) {
                this.logger.warn(`File not found: ${key}`);
                throw new NotFoundException('File not found in storage');
            }

            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            // Force signed URL even for public files. This ensures reliability regardless of bucket privacy settings.
            // Also fixes issues where public domain might be misconfigured or blocked.
            return await getSignedUrl(this.s3Client, command, { 
                expiresIn: expiresInSeconds,
                unhoistableHeaders: new Set(['x-amz-checksum-crc32', 'x-amz-checksum-sha256', 'x-amz-sdk-checksum-algorithm'])
            });

        } catch (error) {
            if (error instanceof NotFoundException) throw error;
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
            return await getSignedUrl(this.s3Client, command, { 
                expiresIn: expiresInSeconds,
                unhoistableHeaders: new Set(['x-amz-checksum-crc32', 'x-amz-checksum-sha256', 'x-amz-sdk-checksum-algorithm'])
            });
        } catch (error) {
            this.logger.error(`Failed to generate upload URL for key: ${key}`, error);
            throw new InternalServerErrorException('Could not generate upload link');
        }
    }

    async initiateMultipartUpload(key: string, contentType: string): Promise<string> {
        try {
            const command = new CreateMultipartUploadCommand({
                Bucket: this.bucketName,
                Key: key,
                ContentType: contentType,
            });
            const response = await this.s3Client.send(command);
            if (!response.UploadId) {
                throw new Error('Failed to retrieve UploadId from CreateMultipartUploadCommand');
            }
            return response.UploadId;
        } catch (error) {
            this.logger.error(`Failed to initiate multipart upload for key: ${key}`, error);
            throw new InternalServerErrorException('Could not initiate multipart upload');
        }
    }

    async generateMultipartUploadPartUrl(key: string, uploadId: string, partNumber: number, expiresInSeconds = 600): Promise<string> {
        try {
            const command = new UploadPartCommand({
                Bucket: this.bucketName,
                Key: key,
                UploadId: uploadId,
                PartNumber: partNumber,
            });
            return await getSignedUrl(this.s3Client, command, { 
                expiresIn: expiresInSeconds,
                unhoistableHeaders: new Set(['x-amz-checksum-crc32', 'x-amz-checksum-sha256', 'x-amz-sdk-checksum-algorithm'])
            });
        } catch (error) {
            this.logger.error(`Failed to generate signed URL for part ${partNumber} of key: ${key}`, error);
            throw new InternalServerErrorException('Could not generate part upload link');
        }
    }

    async completeMultipartUpload(key: string, uploadId: string): Promise<void> {
        try {
            // Fetch uploaded parts from R2 to get their ETags securely (bypasses browser CORS constraints)
            const listCommand = new ListPartsCommand({
                Bucket: this.bucketName,
                Key: key,
                UploadId: uploadId,
            });
            const listResponse = await this.s3Client.send(listCommand);
            const parts = (listResponse.Parts || []).map(p => ({
                PartNumber: p.PartNumber,
                ETag: p.ETag,
            }));

            if (parts.length === 0) {
                throw new Error('No uploaded parts found to complete multipart upload.');
            }

            const command = new CompleteMultipartUploadCommand({
                Bucket: this.bucketName,
                Key: key,
                UploadId: uploadId,
                MultipartUpload: {
                    Parts: parts.sort((a, b) => (a.PartNumber || 0) - (b.PartNumber || 0)),
                },
            });
            await this.s3Client.send(command);
        } catch (error) {
            this.logger.error(`Failed to complete multipart upload for key: ${key}`, error);
            throw new InternalServerErrorException('Could not complete multipart upload');
        }
    }

    async abortMultipartUpload(key: string, uploadId: string): Promise<void> {
        try {
            const command = new AbortMultipartUploadCommand({
                Bucket: this.bucketName,
                Key: key,
                UploadId: uploadId,
            });
            await this.s3Client.send(command);
        } catch (error) {
            this.logger.error(`Failed to abort multipart upload for key: ${key}`, error);
            throw new InternalServerErrorException('Could not abort multipart upload');
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
