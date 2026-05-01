import { Platform } from 'react-native';

const getBaseUrl = () => {
    if (Platform.OS === 'web') return 'http://localhost:5000';
    return 'http://10.162.202.217:5000';
};

export const BASE_URL = getBaseUrl();
export const API_URL = `${BASE_URL}/api`;
