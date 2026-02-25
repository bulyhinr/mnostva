import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from './storage.service';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client } from '@aws-sdk/client-s3';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';

jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: jest.fn().mockImplementation(() => ({
      send: jest.fn().mockResolvedValue({}),
    })),
    GetObjectCommand: jest.fn(),
    PutObjectCommand: jest.fn(),
    HeadObjectCommand: jest.fn(),
  };
});

jest.mock('@aws-sdk/s3-request-presigner');

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(async () => {
    (getSignedUrl as jest.Mock).mockResolvedValue('http://signed-url.com');

    // Clear mocks
    (S3Client as unknown as jest.Mock).mockClear();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key) => {
              if (key === 'R2_BUCKET_NAME') return 'test-bucket';
              if (key === 'R2_PUBLIC_URL') return 'test-public-url';
              if (key === 'R2_ACCESS_KEY_ID') return 'test-key-id';
              if (key === 'R2_SECRET_ACCESS_KEY') return 'test-secret-key';
              if (key === 'R2_ACCOUNT_ID') return 'test-account-id';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateDownloadUrl', () => {
    it('should return a signed URL', async () => {
      const url = await service.generateDownloadUrl('key');
      expect(url).toBe('http://signed-url.com');
      expect(getSignedUrl).toHaveBeenCalled();
    });

    it('should throw NotFoundException if head object fails', async () => {
      (service as any).s3Client.send.mockRejectedValue(new Error('Head Error'));
      const loggerSpy = jest.spyOn((service as any).logger, 'warn').mockImplementation();

      await expect(service.generateDownloadUrl('key')).rejects.toThrow(NotFoundException);
      loggerSpy.mockRestore();
    });

    it('should throw InternalServerErrorException on presigning failure', async () => {
      (service as any).s3Client.send.mockResolvedValue({});
      (getSignedUrl as jest.Mock).mockRejectedValue(new Error('Sign Error'));
      const loggerSpy = jest.spyOn((service as any).logger, 'error').mockImplementation();

      await expect(service.generateDownloadUrl('key')).rejects.toThrow(InternalServerErrorException);
      loggerSpy.mockRestore();
    });
  });

  describe('generateUploadUrl', () => {
    it('should return a signed URL', async () => {
      const url = await service.generateUploadUrl('key', 'image/png');
      expect(url).toBe('http://signed-url.com');
      expect(getSignedUrl).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on error', async () => {
      (getSignedUrl as jest.Mock).mockRejectedValue(new Error('Upload Sign Error'));
      const loggerSpy = jest.spyOn((service as any).logger, 'error').mockImplementation();

      await expect(service.generateUploadUrl('key', 'image/png')).rejects.toThrow(InternalServerErrorException);
      loggerSpy.mockRestore();
    });
  });

  describe('getPublicUrl', () => {
    it('should construct public URL if prefix matches public/', () => {
      expect(service.getPublicUrl('public/image.png')).toBe('test-public-url/public/image.png');
    });

    it('should return null if key is not public', () => {
      expect(service.getPublicUrl('private/image.png')).toBeNull();
    });
  });
});
