import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import api from '../services/api';

interface AuthContextType {
    user: any | null;
    token: string | null;
    isLoading: boolean;
    isInitializing: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (userData: any) => Promise<void>;
    updateProfile: (userData: any) => Promise<void>;
    updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
    forgotPassword: (email: string) => Promise<string | undefined>;
    resetPassword: (token: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser]       = useState<any | null>(null);
    const [token, setToken]     = useState<string | null>(null);
    const [isLoading, setIsLoading]   = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        loadStoredAuth();
    }, []);

    const loadStoredAuth = async () => {
        try {
            const storedToken = await storage.getItemAsync('userToken');
            const storedUser  = await storage.getItemAsync('userData');
            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
        } catch (e) {
            console.error('Failed to load auth state', e);
        } finally {
            setIsInitializing(false);
        }
    };

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, user } = response.data;

            await storage.setItemAsync('userToken', token);
            await storage.setItemAsync('userData', JSON.stringify(user));

            setToken(token);
            setUser(user);
        } catch (error: any) {
            throw error.response?.data?.message || 'Login failed';
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData: any) => {
        setIsLoading(true);
        try {
            const response = await api.post('/auth/register', userData);
            const { token, user } = response.data;

            await storage.setItemAsync('userToken', token);
            await storage.setItemAsync('userData', JSON.stringify(user));

            setToken(token);
            setUser(user);
        } catch (error: any) {
            throw error.response?.data?.message || 'Registration failed';
        } finally {
            setIsLoading(false);
        }
    };

    const updateProfile = async (userData: any) => {
        setIsLoading(true);
        try {
            const response = await api.put('/auth/update-details', userData);
            const updatedUser = response.data.data;

            await storage.setItemAsync('userData', JSON.stringify(updatedUser));
            setUser(updatedUser);
        } catch (error: any) {
            throw error.response?.data?.message || 'Update failed';
        } finally {
            setIsLoading(false);
        }
    };

    const updatePassword = async (currentPassword: string, newPassword: string) => {
        setIsLoading(true);
        try {
            await api.put('/auth/update-password', { currentPassword, newPassword });
        } catch (error: any) {
            throw error.response?.data?.message || 'Password update failed';
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        await storage.deleteItemAsync('userToken');
        await storage.deleteItemAsync('userData');
        setToken(null);
        setUser(null);
    };

    const forgotPassword = async (email: string) => {
        try {
            const response = await api.post('/auth/forgot-password', { email });
            // In development, the backend returns the token
            return response.data.resetToken;
        } catch (error: any) {
            throw error.response?.data?.message || 'Failed to send reset email';
        }
    };

    const resetPassword = async (token: string, password: string) => {
        try {
            await api.put(`/auth/reset-password/${token}`, { password });
        } catch (error: any) {
            throw error.response?.data?.message || 'Failed to reset password';
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, isInitializing, login, register, updateProfile, updatePassword, forgotPassword, resetPassword, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
