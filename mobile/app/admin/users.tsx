import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '../../context/AuthContext';
import { useAppColors } from '@/context/AppThemeContext';
import { Radius, Spacing, Shadows } from '@/constants/theme';
import api from '../../services/api';
import ValidationModal from '@/components/ValidationModal';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}

export default function AdminUsersScreen() {
    const { token } = useAuth();
    const router = useRouter();
    const C = useAppColors();

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState<{
        title: string;
        message: string;
        type: 'error' | 'success' | 'confirm';
        onConfirm?: () => void;
        confirmText?: string;
    }>({
        title: '',
        message: '',
        type: 'error'
    });

    const showModal = (title: string, message: string, type: 'error' | 'success' | 'confirm' = 'error', onConfirm?: () => void, confirmText?: string) => {
        setModalConfig({ title, message, type, onConfirm, confirmText });
        setModalVisible(true);
    };

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data.data);
        } catch (error: any) {
            showModal('Error', error.response?.data?.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchUsers();
    };

    const handleDeleteUser = (userId: string, userName: string) => {
        showModal(
            'Confirm Delete',
            `Are you sure you want to delete user "${userName}"?`,
            'confirm',
            async () => {
                try {
                    await api.delete(`/users/${userId}`);
                    setUsers(users.filter(u => u._id !== userId));
                    showModal('Success', 'User deleted successfully', 'success');
                } catch (error: any) {
                    showModal('Error', error.response?.data?.message || 'Failed to delete user');
                }
            },
            'Delete'
        );
    };

    const renderUserItem = ({ item }: { item: User }) => (
        <View style={[styles.userCard, { backgroundColor: C.card, borderColor: C.border }]}>
            <View style={styles.userHeader}>
                <View style={[styles.avatar, { backgroundColor: C.primaryDim }]}>
                    <ThemedText style={[styles.avatarText, { color: C.primary }]}>
                        {item.name.charAt(0).toUpperCase()}
                    </ThemedText>
                </View>
                <View style={styles.userInfo}>
                    <ThemedText style={styles.userName}>{item.name}</ThemedText>
                    <ThemedText style={[styles.userEmail, { color: C.muted }]}>{item.email}</ThemedText>
                </View>
                <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) + '20', borderColor: getRoleColor(item.role) + '40' }]}>
                    <ThemedText style={[styles.roleText, { color: getRoleColor(item.role) }]}>{item.role}</ThemedText>
                </View>
            </View>
            
            <View style={[styles.cardFooter, { borderTopColor: C.divider }]}>
                <ThemedText style={[styles.dateText, { color: C.muted }]}>
                    Joined: {new Date(item.createdAt).toLocaleDateString()}
                </ThemedText>
                <View style={styles.actions}>
                    <TouchableOpacity 
                        style={styles.actionBtn}
                        onPress={() => showModal('Info', 'Edit user feature coming soon!')}
                    >
                        <Ionicons name="create-outline" size={20} color={C.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.actionBtn}
                        onPress={() => handleDeleteUser(item._id, item.name)}
                    >
                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'Admin': return '#8B5CF6';
            case 'Expert': return '#3B82F6';
            default: return '#0F9D58';
        }
    };

    return (
        <ThemedView style={[styles.container, { backgroundColor: C.bg }]}>
            <Stack.Screen options={{ 
                title: 'User Management',
                headerShown: true,
                headerStyle: { backgroundColor: C.card },
                headerTintColor: C.text,
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
                        <Ionicons name="arrow-back" size={24} color={C.text} />
                    </TouchableOpacity>
                )
            }} />

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={C.primary} />
                </View>
            ) : (
                <FlatList
                    data={users}
                    renderItem={renderUserItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[C.primary]} />
                    }
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Ionicons name="people-outline" size={60} color={C.muted} />
                            <ThemedText style={{ color: C.muted, marginTop: 10 }}>No users found</ThemedText>
                        </View>
                    }
                />
            )}
            <ValidationModal
                visible={modalVisible}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                onConfirm={modalConfig.onConfirm}
                confirmText={modalConfig.confirmText}
                onClose={() => setModalVisible(false)}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: Spacing.md },
    userCard: { borderRadius: Radius.lg, borderWidth: 1, marginBottom: Spacing.md, overflow: 'hidden', ...Shadows.sm },
    userHeader: { flexDirection: 'row', padding: Spacing.md, alignItems: 'center' },
    avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 18, fontWeight: '700' },
    userInfo: { flex: 1, marginLeft: 12 },
    userName: { fontSize: 16, fontWeight: '700' },
    userEmail: { fontSize: 13 },
    roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill, borderWidth: 1 },
    roleText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, borderTopWidth: 1 },
    dateText: { fontSize: 11 },
    actions: { flexDirection: 'row', gap: 15 },
    actionBtn: { padding: 4 },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 }
});
