import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '../../context/AuthContext';
import { useAppColors } from '@/context/AppThemeContext';
import { Radius, Spacing, Shadows } from '@/constants/theme';
import api from '@/services/api';
import ValidationModal from '@/components/ValidationModal';

export default function EditProfileScreen() {
    const { user, updateProfile, logout } = useAuth();
    const router = useRouter();
    const C = useAppColors();

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState<'error' | 'success' | 'confirm'>('error');
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const [modalCallback, setModalCallback] = useState<(() => void) | null>(null);
    const [modalConfirmText, setModalConfirmText] = useState('Okay');

    const showModal = (title: string, message: string, type: 'error' | 'success' | 'confirm' = 'error', callback?: () => void, confirmText = 'Okay') => {
        setModalTitle(title);
        setModalMessage(message);
        setModalType(type);
        setModalCallback(() => callback);
        setModalConfirmText(confirmText);
        setModalVisible(true);
    };

    const handleModalClose = () => {
        setModalVisible(false);
        if (modalCallback) {
            modalCallback();
        }
    };

    const validate = () => {
        if (!name.trim() || !email.trim()) {
            showModal('Error', 'Name and email are required', 'error'); return false;
        }
        if (name.trim().length < 2) {
            showModal('Error', 'Name must be at least 2 characters', 'error'); return false;
        }
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email.trim())) {
            showModal('Error', 'Please enter a valid email address', 'error'); return false;
        }
        return true;
    };

    const handleUpdate = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            await updateProfile({ name: name.trim(), email: email.trim().toLowerCase() });
            showModal('Success', 'Profile updated successfully', 'success', () => router.back());
        } catch (error: any) {
            showModal('Error', error.toString(), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = () => {
        showModal(
            'Delete Account',
            'Are you sure? This will permanently deactivate your account and you will be logged out.',
            'confirm',
            async () => {
                setDeleting(true);
                try {
                    await api.delete(`/users/${user?.id || user?._id}`);
                    await logout();
                } catch (error: any) {
                    showModal('Error', error.response?.data?.message || 'Failed to delete account');
                } finally {
                    setDeleting(false);
                }
            },
            'Delete'
        );
    };

    return (
        <ThemedView style={[styles.container, { backgroundColor: C.bg }]}>
            <Stack.Screen options={{
                title: 'Edit Profile',
                headerShown: true,
                headerStyle: { backgroundColor: C.card },
                headerTintColor: C.text,
                headerShadowVisible: false,
            }} />

            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <ThemedText style={[styles.label, { color: C.muted }]}>FULL NAME</ThemedText>
                        <TextInput
                            style={[styles.input, { backgroundColor: C.card, color: C.text, borderColor: C.border }]}
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your name"
                            placeholderTextColor={C.muted}
                            autoCapitalize="words"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <ThemedText style={[styles.label, { color: C.muted }]}>EMAIL ADDRESS</ThemedText>
                        <TextInput
                            style={[styles.input, { backgroundColor: C.card, color: C.text, borderColor: C.border }]}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Enter your email"
                            placeholderTextColor={C.muted}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={[styles.roleRow, { backgroundColor: C.card, borderColor: C.border }]}>
                        <Ionicons name="shield-checkmark-outline" size={18} color={C.primary} />
                        <ThemedText style={[styles.roleText, { color: C.text }]}>Role: {user?.role}</ThemedText>
                        <View style={[styles.roleBadge, { backgroundColor: C.primaryDim }]}>
                            <ThemedText style={[styles.roleBadgeText, { color: C.primary }]}>{user?.role}</ThemedText>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.saveBtn, { backgroundColor: C.primary, opacity: loading ? 0.7 : 1 }]}
                        onPress={handleUpdate}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#FFF" /> : (
                            <ThemedText style={styles.saveBtnText}>Save Changes</ThemedText>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.deleteBtn, { opacity: deleting ? 0.7 : 1 }]}
                        onPress={handleDeleteAccount}
                        disabled={deleting}
                    >
                        {deleting ? <ActivityIndicator color="#EF4444" /> : (
                            <>
                                <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                <ThemedText style={styles.deleteBtnText}>Delete Account</ThemedText>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <ValidationModal
                visible={modalVisible}
                title={modalTitle}
                message={modalMessage}
                type={modalType}
                onConfirm={modalCallback || undefined}
                confirmText={modalConfirmText}
                onClose={handleModalClose}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: Spacing.lg },
    form: { gap: Spacing.lg },
    inputGroup: { gap: 8 },
    label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
    input: { height: 50, borderRadius: Radius.md, paddingHorizontal: 16, borderWidth: 1, fontSize: 16 },
    roleRow: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        padding: 14, borderRadius: Radius.md, borderWidth: 1,
    },
    roleText: { flex: 1, fontSize: 15 },
    roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill },
    roleBadgeText: { fontSize: 12, fontWeight: '700' },
    saveBtn: { height: 55, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center', ...Shadows.md },
    saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
    deleteBtn: {
        height: 50, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center',
        flexDirection: 'row', gap: 8, borderWidth: 1.5, borderColor: '#EF444440', backgroundColor: '#FEE2E2',
    },
    deleteBtnText: { fontSize: 15, fontWeight: '700', color: '#EF4444' },
});
