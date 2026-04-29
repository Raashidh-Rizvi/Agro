import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '../../context/AuthContext';
import { useAppColors } from '@/context/AppThemeContext';
import { Radius, Spacing, Shadows } from '@/constants/theme';

export default function ChangePasswordScreen() {
    const { updatePassword } = useAuth();
    const router = useRouter();
    const C = useAppColors();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });

    const handleUpdate = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters long');
            return;
        }

        setLoading(true);
        try {
            await updatePassword(currentPassword, newPassword);
            Alert.alert('Success', 'Password updated successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error);
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
