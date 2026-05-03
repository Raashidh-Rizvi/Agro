import axios from 'axios';
import { API_URL } from '../constants/Config';
import { storage } from '../utils/storage';

const api = axios.create({
  baseURL: API_URL,
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
        if (config.headers && typeof config.headers.set === 'function') {
           config.headers.set('Authorization', `Bearer ${token}`);
        } else {
           config.headers.Authorization = `Bearer ${token}`;
        }
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
