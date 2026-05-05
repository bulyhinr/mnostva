import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';
import { orderService } from './orderService';

vi.mock('axios');
const mockedAxios = axios as any; // Using any for simplicity in this environment, or vi.Mocked if available

describe('orderService mapping robustness', () => {
    it('should handle orders where product has null galleryImages', async () => {
        const mockOrder = {
            id: 'order-1',
            totalAmount: 1000,
            createdAt: '2023-01-01',
            items: [
                {
                    id: 'item-1',
                    price: 1000,
                    product: {
                        id: 'prod-1',
                        title: 'Test Product',
                        galleryImages: null, // This caused the crash before
                        previewImageKey: 'key1'
                    }
                }
            ]
        };

        mockedAxios.get.mockResolvedValue({ data: [mockOrder] });

        const orders = await orderService.getMyOrders('mock-token');
        
        expect(orders[0].items[0].name).toBe('Test Product');
        // The mapping logic in orderService.ts doesn't actually process galleryImages yet,
        // it just maps items. But the crash happened in components.
    });

    it('should handle orders where product is deleted (null)', async () => {
        const mockOrder = {
            id: 'order-1',
            totalAmount: 1000,
            createdAt: '2023-01-01',
            items: [
                {
                    id: 'item-1',
                    price: 1000,
                    product: null // Deleted product
                }
            ]
        };

        mockedAxios.get.mockResolvedValue({ data: [mockOrder] });

        const orders = await orderService.getMyOrders('mock-token');
        
        expect(orders[0].items[0].name).toBe('Deleted Asset');
        expect(orders[0].items[0].isDeleted).toBe(true);
    });
});
