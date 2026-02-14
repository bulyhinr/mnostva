import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { DownloadLog } from './entities/download-log.entity';

@Injectable()
export class DownloadsService {
    private r2Client: S3Client;
    private bucketName: string;

    constructor(
        @InjectRepository(DownloadLog)
        private logsRepository: Repository<DownloadLog>,
        private configService: ConfigService,
    ) {
        const endpoint = this.configService.getOrThrow<string>('R2_ENDPOINT');
        const accessKeyId = this.configService.getOrThrow<string>('R2_ACCESS_KEY_ID');
        const secretAccessKey = this.configService.getOrThrow<string>('R2_SECRET_ACCESS_KEY');

        // Initialize R2 Client
        this.r2Client = new S3Client({
            region: 'auto',
            endpoint,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });
        this.bucketName = this.configService.getOrThrow<string>('R2_BUCKET_NAME');
    }

    async generateSignedUrl(fileKey: string, expiresInSeconds: number = 600): Promise<string> {
        if (!fileKey) {
            throw new BadRequestException('File key is required');
        }

        try {
            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: fileKey,
            });

            // Generate signed URL
            return getSignedUrl(this.r2Client, command, { expiresIn: expiresInSeconds });
        } catch (error) {
            console.error('Error generating signed URL:', error);
            throw new NotFoundException('Could not generate download link');
        }
    }

    async logDownload(logData: Partial<DownloadLog>): Promise<DownloadLog> {
        const log = this.logsRepository.create(logData);
        return this.logsRepository.save(log);
    }
}
