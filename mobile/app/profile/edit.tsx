import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '../../context/AuthContext';
import { useAppColors } from '@/context/AppThemeContext';
import { Radius, Spacing, Shadows } from '@/constants/theme';

export default function EditProfileScreen() {
    const { user, updateProfile } = useAuth();
    const router = useRouter();
    const C = useAppColors();

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        if (!name || !email) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            await updateProfile({ name, email });
            Alert.alert('Success', 'Profile updated successfully', [
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
                title: 'Edit Profile',
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
                    <View style={styles.inputGroup}>
                        <ThemedText style={[styles.label, { color: C.muted }]}>FULL NAME</ThemedText>
                        <TextInput
                            style={[styles.input, { backgroundColor: C.card, color: C.text, borderColor: C.border }]}
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your name"
                            placeholderTextColor={C.muted}
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

                    <TouchableOpacity 
                        style={[styles.saveBtn, { backgroundColor: C.primary }]} 
                        onPress={handleUpdate}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <ThemedText style={styles.saveBtnText}>Save Changes</ThemedText>
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
    input: { height: 50, borderRadius: Radius.md, paddingHorizontal: 16, borderWidth: 1, fontSize: 16 },
    saveBtn: { height: 55, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.lg, ...Shadows.md },
    saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' }
});
