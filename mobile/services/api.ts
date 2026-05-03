import axios from 'axios';
import { API_URL } from '../constants/Config';
import { storage } from '../utils/storage';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await storage.getItemAsync('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        // console.log(`[API] Token attached to ${config.url}`);
      } else {
        // console.log(`[API] No token found for ${config.url}`);
      }
    } catch (error) {
      console.error('Error fetching token from storage', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
