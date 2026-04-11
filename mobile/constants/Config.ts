import { Platform } from 'react-native';

const getApiUrl = () => {
    // If running in web browser on the same machine
    if (Platform.OS === 'web') {
        return 'http://localhost:5000/api';
    }
    // For physical mobile devices or simulators not on localhost
    return 'http://10.176.134.217:5000/api';
};

export const API_URL = getApiUrl();
