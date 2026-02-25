import { Test, TestingModule } from '@nestjs/testing';
import { DownloadsService } from './downloads.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DownloadLog } from './entities/download-log.entity';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

jest.mock('@aws-sdk/s3-request-presigner', () => ({
    getSignedUrl: jest.fn(),
}));

jest.mock('@aws-sdk/client-s3', () => ({
    S3Client: jest.fn(),
    GetObjectCommand: jest.fn(),
}));

describe('DownloadsService', () => {
    let service: DownloadsService;
    let repository: jest.Mocked<Partial<Repository<DownloadLog>>>;
    let configService: jest.Mocked<Partial<ConfigService>>;

    beforeEach(async () => {
        repository = {
            create: jest.fn(),
            save: jest.fn(),
        };

        configService = {
            getOrThrow: jest.fn().mockImplementation((key) => {
                if (key === 'R2_ENDPOINT') return 'http://endpoint';
                if (key === 'R2_ACCESS_KEY_ID') return 'key';
                if (key === 'R2_SECRET_ACCESS_KEY') return 'secret';
                if (key === 'R2_BUCKET_NAME') return 'bucket';
            }),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DownloadsService,
                { provide: getRepositoryToken(DownloadLog), useValue: repository },
                { provide: ConfigService, useValue: configService },
            ],
        }).compile();

        service = module.get<DownloadsService>(DownloadsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('generateSignedUrl', () => {
        it('should generate signed url', async () => {
            (getSignedUrl as jest.Mock).mockResolvedValue('signed-url');

            const url = await service.generateSignedUrl('test.zip');
            expect(url).toBe('signed-url');
        });

        it('should throw BadRequestException if fileKey is empty', async () => {
            await expect(service.generateSignedUrl('')).rejects.toThrow(BadRequestException);
        });

        it('should throw NotFoundException on S3 error', async () => {
            (getSignedUrl as jest.Mock).mockRejectedValue(new Error('S3 error'));
            const errorSpy = jest.spyOn(console, 'error').mockImplementation();

            await expect(service.generateSignedUrl('test.zip')).rejects.toThrow(NotFoundException);
            errorSpy.mockRestore();
        });
    });

    describe('logDownload', () => {
        it('should log download', async () => {
            const dto = { ipAddress: '127.0.0.1' };
            repository.create.mockReturnValue({ id: '1', ...dto } as any);
            repository.save.mockResolvedValue({ id: '1', ...dto } as any);

            const result = await service.logDownload(dto);
            expect(result).toHaveProperty('id', '1');
            expect(result.ipAddress).toBe('127.0.0.1');
            expect(repository.create).toHaveBeenCalledWith(dto);
            expect(repository.save).toHaveBeenCalled();
        });
    });
});
