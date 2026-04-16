import Constants from 'expo-constants';
import { Platform } from 'react-native';

const normalizeApiUrl = (value: string) => value.replace(/\/+$/, '');

const getHostFromUri = (value?: string | null) => {
  if (!value) return null;

  const match = value.match(/\/\/([^/:]+)/);
  return match?.[1] ?? null;
};

const getExpoHost = () => {
  const configHost = Constants.expoConfig?.hostUri?.split(':')[0];
  if (configHost) return configHost;

  const manifestHost = getHostFromUri(Constants.linkingUri);
  if (manifestHost) return manifestHost;

  return null;
};

const getApiUrl = () => {
  const envApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (envApiUrl) {
    return normalizeApiUrl(envApiUrl);
  }

  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api';
  }

  const expoHost = getExpoHost();
  if (expoHost) {
    return `http://${expoHost}:5000/api`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }

  return 'http://localhost:5000/api';
};

export const API_URL = getApiUrl();
