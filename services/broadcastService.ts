import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface BroadcastPayload {
    subject: string;
    body: string;
    imageUrl?: string;
    featuredProductId?: string;
    ctaText?: string;
    ctaLink?: string;
    templateType: 'promo' | 'announcement' | 'new_release';
    testEmailOnly?: boolean;
    testRecipient?: string;
}

export const broadcastService = {
    async sendBroadcast(token: string, payload: BroadcastPayload) {
        const response = await axios.post(`${API_URL}/email/broadcast`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};
