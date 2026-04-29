import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import axios from 'axios';
import { API_URL } from '../constants/Config';

interface AuthContextType {
    user: any | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (userData: any) => Promise<void>;
    updateProfile: (userData: any) => Promise<void>;
    updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStoredAuth();
    }, []);

    const loadStoredAuth = async () => {
        try {
            const storedToken = await storage.getItemAsync('userToken');
            const storedUser = await storage.getItemAsync('userData');

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
                axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            }
        } catch (e) {
            console.error('Failed to load auth state', e);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_URL}/auth/login`, { email, password });
            const { token, user } = response.data;

            await storage.setItemAsync('userToken', token);
            await storage.setItemAsync('userData', JSON.stringify(user));

            setToken(token);
            setUser(user);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch (error: any) {
            throw error.response?.data?.message || 'Login failed';
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData: any) => {
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_URL}/auth/register`, userData);
            const { token, user } = response.data;

            await storage.setItemAsync('userToken', token);
            await storage.setItemAsync('userData', JSON.stringify(user));

            setToken(token);
            setUser(user);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch (error: any) {
            throw error.response?.data?.message || 'Registration failed';
        } finally {
            setIsLoading(false);
        }
    };

    const updateProfile = async (userData: any) => {
        setIsLoading(true);
        try {
            const response = await axios.put(`${API_URL}/auth/update-details`, userData);
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
            await axios.put(`${API_URL}/auth/update-password`, { currentPassword, newPassword });
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
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, register, updateProfile, updatePassword, logout }}>
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
