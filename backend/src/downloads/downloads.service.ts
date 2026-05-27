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
            requestChecksumCalculation: 'WHEN_REQUIRED' as any,
            responseChecksumValidation: 'WHEN_REQUIRED' as any,
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
             return await getSignedUrl(this.r2Client, command, { 
                 expiresIn: expiresInSeconds,
                 unhoistableHeaders: new Set(['x-amz-checksum-crc32', 'x-amz-checksum-sha256', 'x-amz-sdk-checksum-algorithm'])
             });
        } catch (error) {
            console.error('Error generating signed URL:', error);
            throw new NotFoundException('Could not generate download link');
        }
    }

    async logDownload(logData: Partial<DownloadLog>): Promise<DownloadLog> {
        const log = this.logsRepository.create(logData);
        return this.logsRepository.save(log);
    }

    async hasDownloadedBefore(userId: string, productId: string): Promise<boolean> {
        const count = await this.logsRepository.count({
            where: {
                user: { id: userId },
                product: { id: productId }
            }
        });
        return count > 0;
    }

    async findAll(page: number = 1, limit: number = 30, title?: string, email?: string): Promise<{ data: DownloadLog[], total: number }> {
        const qb = this.logsRepository.createQueryBuilder('log')
            .leftJoinAndSelect('log.user', 'user')
            .leftJoinAndSelect('log.product', 'product')
            .orderBy('log.downloadedAt', 'DESC');

        if (title) {
            qb.andWhere('product.title ILIKE :title', { title: `%${title}%` });
        }

        if (email) {
            qb.andWhere('user.email ILIKE :email', { email: `%${email}%` });
        }

        qb.skip((page - 1) * limit);
        qb.take(limit);

        const [data, total] = await qb.getManyAndCount();
        return { data, total };
    }
}
