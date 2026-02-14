import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    fileKey: string;
    category: string;
    previewImageKey?: string;
    features?: string[];
    packContent?: string[];
    compatibility?: string[];
    technicalSpecs?: {
        polyCount?: string;
        textures?: string;
        rigged?: boolean;
        animated?: boolean;
    };
    externalLinks?: {
        unity?: string;
        fab?: string;
        cgtrader?: string;
        artstation?: string;
    };
    galleryImages?: string[];
    discount?: any;
}

export const productService = {
    async getAllProducts(params?: { limit?: number; sortBy?: string }) {
        const query = new URLSearchParams(params as any).toString();
        const response = await axios.get<{ data: Product[] }>(`${API_URL}/products?${query}`);
        return response.data.data;
    },

    async getProductById(id: string) {
        const response = await axios.get<Product>(`${API_URL}/products/${id}`);
        return response.data;
    },

    async createProduct(productData: Partial<Product>, token: string) {
        const response = await axios.post<Product>(`${API_URL}/products`, productData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    async updateProduct(id: string, productData: Partial<Product>, token: string) {
        const response = await axios.patch<Product>(`${API_URL}/products/${id}`, productData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    async deleteProduct(id: string, token: string) {
        await axios.delete(`${API_URL}/products/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }
};
