import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppColors } from '@/context/AppThemeContext';
import { Radius, Spacing, Shadows } from '@/constants/theme';
import ValidationModal from '@/components/ValidationModal';

export default function NotificationsScreen() {
    const router = useRouter();
    const C = useAppColors();

    const [settings, setSettings] = useState({
        push: true,
        email: false,
        alerts: true,
        news: false
    });

    const [modalVisible, setModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'error' as 'error' | 'success' });

    const showModal = (title: string, message: string, type: 'error' | 'success' = 'error') => {
        setModalConfig({ title, message, type });
        setModalVisible(true);
    };

    const toggle = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = () => {
        showModal('Success', 'Notification preferences saved!', 'success');
    };

    return (
        <ThemedView style={[styles.container, { backgroundColor: C.bg }]}>
            <Stack.Screen options={{ 
                title: 'Notifications',
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
                <View style={styles.header}>
                    <Ionicons name="notifications-outline" size={60} color={C.primary} />
                    <ThemedText style={styles.title}>Notifications</ThemedText>
                    <ThemedText style={[styles.subtitle, { color: C.muted }]}>
                        Manage how you receive alerts and updates from AgriSense Lanka.
                    </ThemedText>
                </View>

                <View style={styles.group}>
                    <ThemedText style={[styles.sectionTitle, { color: C.muted }]}>GENERAL</ThemedText>
                    <View style={[styles.card, { backgroundColor: C.card, borderColor: C.border }]}>
                        <View style={styles.row}>
                            <View style={styles.rowInfo}>
                                <ThemedText style={styles.rowLabel}>Push Notifications</ThemedText>
                                <ThemedText style={[styles.rowDesc, { color: C.muted }]}>Receive alerts on your device</ThemedText>
                            </View>
                            <Switch 
                                value={settings.push} 
                                onValueChange={() => toggle('push')}
                                trackColor={{ false: '#767577', true: C.primary + '80' }}
                                thumbColor={settings.push ? C.primary : '#f4f3f4'}
                            />
                        </View>
                        <View style={[styles.divider, { backgroundColor: C.divider }]} />
                        <View style={styles.row}>
                            <View style={styles.rowInfo}>
                                <ThemedText style={styles.rowLabel}>Email Notifications</ThemedText>
                                <ThemedText style={[styles.rowDesc, { color: C.muted }]}>Receive weekly reports via email</ThemedText>
                            </View>
                            <Switch 
                                value={settings.email} 
                                onValueChange={() => toggle('email')}
                                trackColor={{ false: '#767577', true: C.primary + '80' }}
                                thumbColor={settings.email ? C.primary : '#f4f3f4'}
                            />
                        </View>
                    </View>
                </View>

                <View style={[styles.group, { marginTop: 24 }]}>
                    <ThemedText style={[styles.sectionTitle, { color: C.muted }]}>ALERTS</ThemedText>
                    <View style={[styles.card, { backgroundColor: C.card, borderColor: C.border }]}>
                        {[
                            { key: 'alerts', label: 'Agricultural Alerts', desc: 'Weather & pest warnings' },
                            { key: 'news', label: 'AgriNews', desc: 'Latest farming news in SL' },
                        ].map((item, idx) => (
                            <React.Fragment key={item.key}>
                                <View style={styles.row}>
                                    <View style={styles.rowInfo}>
                                        <ThemedText style={styles.rowLabel}>{item.label}</ThemedText>
                                        <ThemedText style={[styles.rowDesc, { color: C.muted }]}>{item.desc}</ThemedText>
                                    </View>
                                    <Switch 
                                        value={settings[item.key as keyof typeof settings]} 
                                        onValueChange={() => toggle(item.key as keyof typeof settings)}
                                        trackColor={{ false: '#767577', true: C.primary + '80' }}
                                        thumbColor={settings[item.key as keyof typeof settings] ? C.primary : '#f4f3f4'}
                                    />
                                </View>
                                {idx < 1 && <View style={[styles.divider, { backgroundColor: C.divider }]} />}
                            </React.Fragment>
                        ))}
                    </View>
                </View>

                <TouchableOpacity 
                    style={[styles.saveBtn, { backgroundColor: C.primary }]} 
                    onPress={handleSave}
                >
                    <ThemedText style={styles.saveBtnText}>Save Preferences</ThemedText>
                </TouchableOpacity>
            </ScrollView>
            <ValidationModal
                visible={modalVisible}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                onClose={() => {
                    setModalVisible(false);
                    if (modalConfig.type === 'success') {
                        router.back();
                    }
                }}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: Spacing.lg },
    header: { alignItems: 'center', marginBottom: Spacing.xl, gap: 10 },
    title: { fontSize: 24, fontWeight: '800' },
    subtitle: { fontSize: 14, textAlign: 'center', paddingHorizontal: 20 },
    group: { gap: 8 },
    sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
    card: { borderRadius: Radius.lg, borderWidth: 1, overflow: 'hidden' },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
    rowInfo: { flex: 1, marginRight: 10 },
    rowLabel: { fontSize: 16, fontWeight: '700' },
    rowDesc: { fontSize: 12, marginTop: 2 },
    divider: { height: 1 },
    saveBtn: { height: 55, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.xxl, ...Shadows.md },
    saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' }
});
