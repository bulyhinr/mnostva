import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const couponService = {
    validateCoupon: async (code: string) => {
        const response = await axios.get(`${API_URL}/coupons/validate/${code}`);
        return response.data;
    },

    // Admin methods
    getAllCoupons: async (token: string) => {
        const response = await axios.get(`${API_URL}/coupons`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    createCoupon: async (data: { code: string; discountPercentage: number; maxUses?: number }, token: string) => {
        const response = await axios.post(`${API_URL}/coupons`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    toggleCouponActive: async (id: string, token: string) => {
        const response = await axios.patch(`${API_URL}/coupons/${id}/toggle`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};
