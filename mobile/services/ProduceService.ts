import api from './api';
import { Platform } from 'react-native';

export interface ProduceListing {
    _id: string;
    userId: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
    sellerName: string;
    rating: number;
    badge?: string;
    createdAt: string;
    updatedAt: string;
}

export const ProduceService = {
    /**
     * Get all produce listings with optional filters
     */
    getAll: async (category?: string, search?: string): Promise<ProduceListing[]> => {
        const params: any = {};
        if (category && category !== 'All') params.category = category;
        if (search) params.search = search;

        const response = await api.get('/produce', { params });
        if (response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Failed to fetch produce');
        }
    },

    /**
     * Get produce by ID
     */
    getById: async (id: string): Promise<ProduceListing> => {
        const response = await api.get(`/produce/${id}`);
        if (response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Failed to fetch produce details');
        }
    },

    /**
     * Get current user's listings
     */
    getMyListings: async (): Promise<ProduceListing[]> => {
        const response = await api.get('/produce/my/listings');
        if (response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Failed to fetch your listings');
        }
    },

    /**
     * Create a new produce listing
     */
    create: async (data: any, imageUri?: string): Promise<ProduceListing> => {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('description', data.description);
        formData.append('price', data.price.toString());
        formData.append('category', data.category);

        if (imageUri) {
            if (Platform.OS === 'web') {
                const response = await fetch(imageUri);
                const blob = await response.blob();
                formData.append('image', blob, 'product.jpg');
            } else {
                const filename = imageUri.split('/').pop() || 'product.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image/jpeg`;

                // @ts-ignore
                formData.append('image', {
                    uri: imageUri,
                    name: filename,
                    type: type,
                });
            }
        }

        const response = await api.post('/produce', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Failed to create listing');
        }
    },

    /**
     * Update an existing listing
     */
    update: async (id: string, data: any, imageUri?: string): Promise<ProduceListing> => {
        const formData = new FormData();
        if (data.name) formData.append('name', data.name);
        if (data.description) formData.append('description', data.description);
        if (data.price) formData.append('price', data.price.toString());
        if (data.category) formData.append('category', data.category);

        if (imageUri) {
            if (Platform.OS === 'web') {
                const response = await fetch(imageUri);
                const blob = await response.blob();
                formData.append('image', blob, 'product.jpg');
            } else {
                const filename = imageUri.split('/').pop() || 'product.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image/jpeg`;

                // @ts-ignore
                formData.append('image', {
                    uri: imageUri,
                    name: filename,
                    type: type,
                });
            }
        }

        const response = await api.put(`/produce/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Failed to update listing');
        }
    },

    /**
     * Delete a listing
     */
    delete: async (id: string): Promise<void> => {
        const response = await api.delete(`/produce/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to delete listing');
        }
    }
};
