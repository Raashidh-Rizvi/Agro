import { Platform } from 'react-native';

const getBaseUrl = () => {
    if (process.env.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL.replace('/api', '');
    }
    if (Platform.OS === 'web') return 'http://localhost:5000';
    return 'http://192.168.1.6:5000';
};

export const BASE_URL = getBaseUrl();
export const API_URL = process.env.EXPO_PUBLIC_API_URL || `${BASE_URL}/api`;
