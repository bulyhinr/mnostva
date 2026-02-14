import axios from 'axios';
import { Discount } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const discountService = {
    async getAllDiscounts(token: string) {
        const response = await axios.get<Discount[]>(`${API_URL}/discounts`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    async createDiscount(discountData: Partial<Discount>, token: string) {
        const response = await axios.post<Discount>(`${API_URL}/discounts`, discountData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    async updateDiscount(id: string, discountData: Partial<Discount>, token: string) {
        const response = await axios.patch<Discount>(`${API_URL}/discounts/${id}`, discountData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    async deleteDiscount(id: string, token: string) {
        await axios.delete(`${API_URL}/discounts/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }
};
