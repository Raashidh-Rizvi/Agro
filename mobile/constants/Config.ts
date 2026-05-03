import { Platform } from 'react-native';

const getBaseUrl = () => {
    if (Platform.OS === 'web') return 'http://localhost:5000';
    return 'http://172.20.10.2:5000';
};

export const BASE_URL = getBaseUrl();
export const API_URL = `${BASE_URL}/api`;
