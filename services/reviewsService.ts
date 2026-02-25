import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const reviewsService = {
    async create(productId: string, rating: number, comment: string, token: string) {
        const response = await axios.post(`${API_URL}/reviews`, {
            productId,
            rating,
            comment
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    async getByProduct(productId: string) {
        const response = await axios.get(`${API_URL}/reviews/product/${productId}`);
        return response.data;
    },

    async getStats(productId: string) {
        const response = await axios.get(`${API_URL}/reviews/product/${productId}/stats`);
        return response.data;
    }
};
