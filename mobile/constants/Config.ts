import { Platform } from 'react-native';

const getBaseUrl = () => {
    // If running in web browser on the same machine
    if (Platform.OS === 'web') {
        return 'http://localhost:5000';
    }
    // For physical mobile devices or simulators not on localhost
    return 'http://172.28.24.38:5000';
};

export const BASE_URL = getBaseUrl();
export const API_URL = `${BASE_URL}/api`;
