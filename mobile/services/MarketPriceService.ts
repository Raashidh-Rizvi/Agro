import api from './api';

export interface MarketPrice {
    _id: string;
    cropName: string;
    district: string;
    price: number;
    unit: string;
    trend: 'up' | 'down' | 'stable';
    date: string;
    addedBy: {
        _id: string;
        name: string;
    };
    createdAt: string;
}

export const MarketPriceService = {
    getAll: async (filters?: { district?: string; cropName?: string }): Promise<MarketPrice[]> => {
        const response = await api.get('/market-prices', { params: filters });
        if (response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Failed to fetch market prices');
        }
    },

    getById: async (id: string): Promise<MarketPrice> => {
        const response = await api.get(`/market-prices/${id}`);
        if (response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Failed to fetch market price');
        }
    },

    create: async (data: Partial<MarketPrice>): Promise<MarketPrice> => {
        const response = await api.post('/market-prices', data);
        if (response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Failed to create market price');
        }
    },

    update: async (id: string, data: Partial<MarketPrice>): Promise<MarketPrice> => {
        const response = await api.put(`/market-prices/${id}`, data);
        if (response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Failed to update market price');
        }
    },

    delete: async (id: string): Promise<void> => {
        const response = await api.delete(`/market-prices/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to delete market price');
        }
    }
};
