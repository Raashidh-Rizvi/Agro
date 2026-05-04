import { Platform } from 'react-native';
import api from './api';

export interface DiagnosisResult {
    id: string;
    diseaseName: string;
    confidenceScore: number;
    recommendation: string;
    cause?: string;
    symptoms?: string[];
    treatment?: string[];
    prevention?: string[];
    imageUrl: string;
    isMock: boolean;
    createdAt: string;
}

export const DiagnosisService = {
    /**
     * Upload an image to the backend for disease prediction
     * @param imageUri Local URI of the image
     * @returns Prediction result
     */
    predict: async (imageUri: string): Promise<DiagnosisResult> => {
        const formData = new FormData();
        
        if (Platform.OS === 'web') {
            // On Web, we need to convert the URI to a Blob/File
            const response = await fetch(imageUri);
            const blob = await response.blob();
            formData.append('image', blob, 'image.jpg');
        } else {
            // On Native, we use the special object format
            const filename = imageUri.split('/').pop() || 'image.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;

            // @ts-ignore - FormData expects an object with uri, name, and type in React Native
            formData.append('image', {
                uri: imageUri,
                name: filename,
                type: type,
            });
        }

        const response = await api.post('/diagnosis/predict', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Prediction failed');
        }
    },

    /**
     * Fetch diagnosis history for the current user
     */
    getHistory: async (): Promise<DiagnosisResult[]> => {
        const response = await api.get('/diagnosis/history');
        if (response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Failed to fetch history');
        }
    },

    /**
     * Delete a diagnosis record
     * @param id The ID of the diagnosis to delete
     */
    deleteDiagnosis: async (id: string): Promise<void> => {
        const response = await api.delete(`/diagnosis/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to delete record');
        }
    }
};
