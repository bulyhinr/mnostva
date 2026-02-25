import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const wishlistService = {
    async toggle(productId: string, token: string) {
        const response = await axios.post(`${API_URL}/wishlist/${productId}/toggle`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    async getWishlist(token: string) {
        const response = await axios.get(`${API_URL}/wishlist`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    async checkStatus(productId: string, token: string) {
        const response = await axios.get(`${API_URL}/wishlist/${productId}/check`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};
