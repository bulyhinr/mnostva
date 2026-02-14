import axios from 'axios';
import { Order, CartItem, Product } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const mapOrderToFrontend = (order: any) => ({
    ...order,
    total: order.totalAmount ? order.totalAmount / 100 : 0,
    date: order.createdAt,
    items: order.items.map((item: any) => {
        const product = item.product;
        if (!product) {
            return {
                ...item,
                name: 'Deleted Asset',
                imageUrl: 'https://placehold.co/600x400?text=Deleted+Asset',
                price: item.price / 100,
                isDeleted: true
            };
        }
        return {
            ...item,
            name: product.title,
            imageUrl: product.previewImageKey ? `${API_URL}/storage/public/${product.previewImageKey}` : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
            price: item.price / 100,
            productId: product.id,
            isDeleted: false
        };
    })
});

export const orderService = {
    async createOrder(items: CartItem[], total: number, token: string, userId?: string) {
        const response = await axios.post(`${API_URL}/orders`, {
            userId,
            items: items.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                price: item.discount && item.discount.isActive
                    ? item.price * (1 - item.discount.percentage / 100)
                    : item.price
            })),
            total
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return mapOrderToFrontend(response.data);
    },

    async getMyOrders(token: string) {
        const response = await axios.get<any[]>(`${API_URL}/orders/my-orders`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        return response.data.map(mapOrderToFrontend);
    }
};
