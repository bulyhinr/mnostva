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
    CreateMultipartUploadCommand: jest.fn(),
    UploadPartCommand: jest.fn(),
    CompleteMultipartUploadCommand: jest.fn(),
    AbortMultipartUploadCommand: jest.fn(),
    ListPartsCommand: jest.fn(),
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

  describe('initiateMultipartUpload', () => {
    it('should return an uploadId', async () => {
      (service as any).s3Client.send.mockResolvedValue({ UploadId: 'test-upload-id' });
      const uploadId = await service.initiateMultipartUpload('key', 'application/zip');
      expect(uploadId).toBe('test-upload-id');
    });

    it('should throw InternalServerErrorException if UploadId is missing', async () => {
      (service as any).s3Client.send.mockResolvedValue({});
      const loggerSpy = jest.spyOn((service as any).logger, 'error').mockImplementation();
      await expect(service.initiateMultipartUpload('key', 'application/zip')).rejects.toThrow(InternalServerErrorException);
      loggerSpy.mockRestore();
    });
  });

  describe('generateMultipartUploadPartUrl', () => {
    it('should return a signed URL for a part', async () => {
      (getSignedUrl as jest.Mock).mockResolvedValue('http://signed-url.com/part');
      const url = await service.generateMultipartUploadPartUrl('key', 'uploadId', 1);
      expect(url).toBe('http://signed-url.com/part');
      expect(getSignedUrl).toHaveBeenCalled();
    });
  });

  describe('completeMultipartUpload', () => {
    it('should successfully complete the upload', async () => {
      (service as any).s3Client.send
        .mockResolvedValueOnce({ Parts: [{ PartNumber: 1, ETag: 'etag-1' }] }) // for ListPartsCommand
        .mockResolvedValueOnce({}); // for CompleteMultipartUploadCommand

      await expect(service.completeMultipartUpload('key', 'uploadId')).resolves.not.toThrow();
    });

    it('should throw Error/InternalServerErrorException if no parts found', async () => {
      (service as any).s3Client.send.mockResolvedValueOnce({ Parts: [] });
      const loggerSpy = jest.spyOn((service as any).logger, 'error').mockImplementation();
      await expect(service.completeMultipartUpload('key', 'uploadId')).rejects.toThrow(InternalServerErrorException);
      loggerSpy.mockRestore();
    });
  });

  describe('abortMultipartUpload', () => {
    it('should successfully abort the upload', async () => {
      (service as any).s3Client.send.mockResolvedValue({});
      await expect(service.abortMultipartUpload('key', 'uploadId')).resolves.not.toThrow();
    });
  });
});
