import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '../../context/AuthContext';
import { useAppColors } from '@/context/AppThemeContext';
import { Radius, Spacing, Shadows } from '@/constants/theme';
import ValidationModal from '@/components/ValidationModal';
import { validatePassword } from '../../utils/passwordValidation';

export default function ChangePasswordScreen() {
    const { user, updatePassword } = useAuth();
    const router = useRouter();
    const C = useAppColors();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });

    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState<'error' | 'success'>('error');
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const [modalCallback, setModalCallback] = useState<(() => void) | null>(null);

    const showModal = (title: string, message: string, type: 'error' | 'success' = 'error', callback?: () => void) => {
        setModalTitle(title);
        setModalMessage(message);
        setModalType(type);
        setModalCallback(() => callback);
        setModalVisible(true);
    };

    const handleModalClose = () => {
        setModalVisible(false);
        if (modalCallback) {
            modalCallback();
        }
    };

    const handleUpdate = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            showModal('Error', 'Please fill in all fields', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showModal('Error', 'New passwords do not match', 'error');
            return;
        }

        const passwordErrors = validatePassword(newPassword, { name: user?.name, email: user?.email });
        if (passwordErrors.length > 0) {
            showModal('Weak Password', passwordErrors.join('\n'), 'error');
            return;
        }

        setLoading(true);
        try {
            await updatePassword(currentPassword, newPassword);
            showModal('Success', 'Password updated successfully', 'success', () => router.back());
        } catch (error: any) {
            showModal('Error', error.toString(), 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedView style={[styles.container, { backgroundColor: C.bg }]}>
            <Stack.Screen options={{ 
                title: 'Change Password',
                headerShown: true,
                headerStyle: { backgroundColor: C.card },
                headerTintColor: C.text,
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
                        <Ionicons name="arrow-back" size={24} color={C.text} />
                    </TouchableOpacity>
                )
            }} />
            
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.form}>
                    {/* Current Password */}
                    <View style={styles.inputGroup}>
                        <ThemedText style={[styles.label, { color: C.muted }]}>CURRENT PASSWORD</ThemedText>
                        <View style={styles.passwordInputWrap}>
                            <TextInput
                                style={[styles.input, { backgroundColor: C.card, color: C.text, borderColor: C.border }]}
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                placeholder="Enter current password"
                                placeholderTextColor={C.muted}
                                secureTextEntry={!showPass.current}
                            />
                            <TouchableOpacity 
                                style={styles.eyeIcon} 
                                onPress={() => setShowPass({...showPass, current: !showPass.current})}
                            >
                                <Ionicons name={showPass.current ? "eye-off-outline" : "eye-outline"} size={20} color={C.muted} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* New Password */}
                    <View style={styles.inputGroup}>
                        <ThemedText style={[styles.label, { color: C.muted }]}>NEW PASSWORD</ThemedText>
                        <View style={styles.passwordInputWrap}>
                            <TextInput
                                style={[styles.input, { backgroundColor: C.card, color: C.text, borderColor: C.border }]}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                placeholder="Enter new password"
                                placeholderTextColor={C.muted}
                                secureTextEntry={!showPass.new}
                            />
                            <TouchableOpacity 
                                style={styles.eyeIcon} 
                                onPress={() => setShowPass({...showPass, new: !showPass.new})}
                            >
                                <Ionicons name={showPass.new ? "eye-off-outline" : "eye-outline"} size={20} color={C.muted} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Confirm New Password */}
                    <View style={styles.inputGroup}>
                        <ThemedText style={[styles.label, { color: C.muted }]}>CONFIRM NEW PASSWORD</ThemedText>
                        <View style={styles.passwordInputWrap}>
                            <TextInput
                                style={[styles.input, { backgroundColor: C.card, color: C.text, borderColor: C.border }]}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="Confirm new password"
                                placeholderTextColor={C.muted}
                                secureTextEntry={!showPass.confirm}
                            />
                            <TouchableOpacity 
                                style={styles.eyeIcon} 
                                onPress={() => setShowPass({...showPass, confirm: !showPass.confirm})}
                            >
                                <Ionicons name={showPass.confirm ? "eye-off-outline" : "eye-outline"} size={20} color={C.muted} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity 
                        style={[styles.saveBtn, { backgroundColor: C.primary }]} 
                        onPress={handleUpdate}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <ThemedText style={styles.saveBtnText}>Update Password</ThemedText>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <ValidationModal
                visible={modalVisible}
                title={modalTitle}
                message={modalMessage}
                type={modalType}
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
    passwordInputWrap: { position: 'relative' },
    input: { height: 50, borderRadius: Radius.md, paddingHorizontal: 16, paddingRight: 50, borderWidth: 1, fontSize: 16 },
    eyeIcon: { position: 'absolute', right: 15, top: 15 },
    saveBtn: { height: 55, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.lg, ...Shadows.md },
    saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' }
});
