import { Test, TestingModule } from '@nestjs/testing';
import { StorageController } from './storage.controller';

import { StorageService } from './storage.service';
import { OrdersService } from '../orders/orders.service';
import { ProductsService } from '../products/products.service';
import { DownloadsService } from '../downloads/downloads.service';

describe('StorageController', () => {
  let controller: StorageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StorageController],
      providers: [
        {
          provide: StorageService,
          useValue: {
            generateDownloadUrl: jest.fn(),
            generateUploadUrl: jest.fn(),
            initiateMultipartUpload: jest.fn(),
            generateMultipartUploadPartUrl: jest.fn(),
            completeMultipartUpload: jest.fn(),
            abortMultipartUpload: jest.fn(),
          },
        },
        {
          provide: OrdersService,
          useValue: {
            findByUser: jest.fn(),
          },
        },
        {
          provide: ProductsService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: DownloadsService,
          useValue: {
            logDownload: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<StorageController>(StorageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPublicFile', () => {
    it('should redirect to signed url', async () => {
      const res = { redirect: jest.fn() };
      (controller['storageService'].generateDownloadUrl as jest.Mock).mockResolvedValue('url');

      await controller.getPublicFile({ 0: 'test.png' }, res as any);

      expect(res.redirect).toHaveBeenCalledWith('url');
    });
  });

  describe('generateUploadLink', () => {
    it('should generate upload url', async () => {
      const body = { contentType: 'image/png', isPublic: true };
      const req = { user: { isAdmin: false } };
      (controller['storageService'].generateUploadUrl as jest.Mock).mockResolvedValue('url');

      const result = await controller.generateUploadLink(req, body);
      expect(result).toEqual({ uploadUrl: 'url', key: expect.stringContaining('public/') });
    });
  });

  describe('generateDownloadLink', () => {
    it('should allow admin to download without purchase', async () => {
      const req = { user: { isAdmin: true } };
      const body = { productId: '1' };
      (controller['productsService'].findOne as jest.Mock).mockResolvedValue({ fileKey: 'key', isActive: true });
      (controller['storageService'].generateDownloadUrl as jest.Mock).mockResolvedValue('url');

      const result = await controller.generateDownloadLink(req, body);
      expect(result.downloadUrl).toBe('url');
    });

    it('should allow user who purchased', async () => {
      const req = { user: { userId: 'u1', isAdmin: false } };
      const body = { productId: 'p1' };

      const orders = [{
        status: 'paid',
        items: [{ product: { id: 'p1', fileKey: 'key', isActive: true } }]
      }];
      (controller['ordersService'].findByUser as jest.Mock).mockResolvedValue(orders);
      (controller['storageService'].generateDownloadUrl as jest.Mock).mockResolvedValue('url');

      const result = await controller.generateDownloadLink(req, body);
      expect(result.downloadUrl).toBe('url');
    });

    it('should block user if product is inactive', async () => {
      const req = { user: { userId: 'u1', isAdmin: false } };
      const body = { productId: 'p1' };

      const orders = [{
        status: 'paid',
        items: [{ product: { id: 'p1', fileKey: 'key', isActive: false } }]
      }];
      (controller['ordersService'].findByUser as jest.Mock).mockResolvedValue(orders);

      await expect(controller.generateDownloadLink(req, body)).rejects.toThrow('This asset is temporarily unavailable for download.');
    });

    it('should block admin if product is inactive', async () => {
      const req = { user: { isAdmin: true } };
      const body = { productId: '1' };
      (controller['productsService'].findOne as jest.Mock).mockResolvedValue({ fileKey: 'key', isActive: false });

      await expect(controller.generateDownloadLink(req, body)).rejects.toThrow('This asset is temporarily unavailable for download (Status: Off).');
    });
  });

  describe('initiateMultipart', () => {
    it('should allow admin to initiate upload', async () => {
      const req = { user: { isAdmin: true } };
      const body = { contentType: 'application/zip', isPublic: false };
      (controller['storageService'].initiateMultipartUpload as jest.Mock).mockResolvedValue('test-upload-id');

      const result = await controller.initiateMultipart(req, body);
      expect(result.uploadId).toBe('test-upload-id');
      expect(result.key).toContain('products/');
    });

    it('should enforce public segment for non-admin', async () => {
      const req = { user: { isAdmin: false } };
      const body = { contentType: 'image/png', isPublic: true };
      (controller['storageService'].initiateMultipartUpload as jest.Mock).mockResolvedValue('test-upload-id');

      const result = await controller.initiateMultipart(req, body);
      expect(result.uploadId).toBe('test-upload-id');
      expect(result.key).toContain('public/');
    });

    it('should throw ForbiddenException if non-admin attempts private upload', async () => {
      const req = { user: { isAdmin: false } };
      const body = { contentType: 'application/zip', isPublic: false };

      await expect(controller.initiateMultipart(req, body)).rejects.toThrow('Only admins can upload private assets');
    });
  });

  describe('generateMultipartUrl', () => {
    it('should allow admin to generate url', async () => {
      const req = { user: { isAdmin: true } };
      const body = { key: 'products/file.zip', uploadId: 'id', partNumber: 1 };
      (controller['storageService'].generateMultipartUploadPartUrl as jest.Mock).mockResolvedValue('url');

      const result = await controller.generateMultipartUrl(req, body);
      expect(result.uploadUrl).toBe('url');
    });

    it('should allow non-admin for public key', async () => {
      const req = { user: { isAdmin: false } };
      const body = { key: 'public/avatar.png', uploadId: 'id', partNumber: 1 };
      (controller['storageService'].generateMultipartUploadPartUrl as jest.Mock).mockResolvedValue('url');

      const result = await controller.generateMultipartUrl(req, body);
      expect(result.uploadUrl).toBe('url');
    });

    it('should block non-admin for private key', async () => {
      const req = { user: { isAdmin: false } };
      const body = { key: 'products/file.zip', uploadId: 'id', partNumber: 1 };

      await expect(controller.generateMultipartUrl(req, body)).rejects.toThrow('Only admins can upload private assets');
    });
  });

  describe('completeMultipart', () => {
    it('should allow admin to complete multipart', async () => {
      const req = { user: { isAdmin: true } };
      const body = { key: 'products/file.zip', uploadId: 'id' };
      (controller['storageService'].completeMultipartUpload as jest.Mock).mockResolvedValue(undefined);

      const result = await controller.completeMultipart(req, body);
      expect(result.key).toBe('products/file.zip');
    });

    it('should block non-admin on private key', async () => {
      const req = { user: { isAdmin: false } };
      const body = { key: 'products/file.zip', uploadId: 'id' };

      await expect(controller.completeMultipart(req, body)).rejects.toThrow('Only admins can upload private assets');
    });
  });

  describe('abortMultipart', () => {
    it('should allow admin to abort multipart', async () => {
      const req = { user: { isAdmin: true } };
      const body = { key: 'products/file.zip', uploadId: 'id' };
      (controller['storageService'].abortMultipartUpload as jest.Mock).mockResolvedValue(undefined);

      const result = await controller.abortMultipart(req, body);
      expect(result.success).toBe(true);
    });

    it('should block non-admin on private key', async () => {
      const req = { user: { isAdmin: false } };
      const body = { key: 'products/file.zip', uploadId: 'id' };

      await expect(controller.abortMultipart(req, body)).rejects.toThrow('Only admins can upload private assets');
    });
  });
});
