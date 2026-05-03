import { isAxiosError } from 'axios';
import { Ionicons } from '@expo/vector-icons';

export type AlertType = 'weather' | 'fertilizer' | 'pest' | 'irrigation' | 'general';

export type AdvisoryAlert = {
  _id: string;
  title: string;
  cropType: string;
  district: string;
  season: string;
  message: string;
  alertType: AlertType;
  createdAt: string;
  updatedAt?: string;
  createdBy?: {
    _id: string;
    name: string;
    role: string;
  };
};

export const ALERT_META: Record<
  AlertType,
  { color: string; bg: string; icon: keyof typeof Ionicons.glyphMap; label: string }
> = {
  weather: { color: '#F59E0B', bg: '#FEF3C7', icon: 'rainy-outline', label: 'Weather' },
  fertilizer: { color: '#3B82F6', bg: '#EFF6FF', icon: 'flask-outline', label: 'Fertilizer' },
  pest: { color: '#EF4444', bg: '#FEE2E2', icon: 'bug-outline', label: 'Pest' },
  irrigation: { color: '#0F9D58', bg: '#E6F4EA', icon: 'water-outline', label: 'Irrigation' },
  general: { color: '#6B7280', bg: '#F3F4F6', icon: 'notifications-outline', label: 'General' },
};

export const ALERT_FIELD_LIMITS = {
  title: 120,
  cropType: 80,
  district: 80,
  season: 80,
  message: 1000,
} as const;

export const getAlertErrorMessage = (error: unknown) => {
  if (isAxiosError(error)) {
    return error.response?.data?.message || error.message || 'Request failed';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong';
};

export const formatAlertDate = (value?: string) => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatAlertRelativeTime = (value?: string) => {
  if (!value) return '';

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return '';

  // Get absolute difference in milliseconds
  const diffMs = Math.abs(Date.now() - timestamp);
  const diffMinutes = Math.round(diffMs / (1000 * 60));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
};
