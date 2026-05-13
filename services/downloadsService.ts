import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const downloadsService = {
    async getDownloadLogs(token: string) {
        const response = await axios.get(`${API_URL}/downloads/logs`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    async generateDownloadLink(productId: string, token: string) {
        const response = await axios.post(`${API_URL}/downloads/generate`, {
            productId
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};
