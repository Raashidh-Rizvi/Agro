import React from 'react';
import { Modal, StyleSheet, View, TouchableOpacity, Pressable, Platform, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { useAppColors } from '@/context/AppThemeContext';
import { Radius, Spacing, Shadows, Typography } from '@/constants/theme';
import { BlurView } from 'expo-blur';

export interface SelectionOption {
    id: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    onPress: () => void;
}

interface PremiumSelectionModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    options: SelectionOption[];
    recentHistory?: any[];
    onHistoryItemPress?: (item: any) => void;
}

export function PremiumSelectionModal({ 
    visible, 
    onClose, 
    title, 
    description, 
    options,
    recentHistory = [],
    onHistoryItemPress
}: PremiumSelectionModalProps) {
    const C = useAppColors();

    if (!visible) return null;

    const Content = (
        <Pressable style={styles.overlay} onPress={onClose}>
            <ThemedView style={[styles.modalContainer, { backgroundColor: C.card }]} onStartShouldSetResponder={() => true}>
                <View style={[styles.dragHandle, { backgroundColor: C.border }]} />
                
                <View style={styles.header}>
                    <ThemedText style={styles.title}>{title}</ThemedText>
                    {description && <ThemedText style={[styles.description, { color: C.muted }]}>{description}</ThemedText>}
                </View>

                <View style={styles.optionsContainer}>
                    {options.map((option) => (
                        <TouchableOpacity
                            key={option.id}
                            style={[styles.optionCard, { borderColor: C.border }]}
                            activeOpacity={0.7}
                            onPress={() => {
                                option.onPress();
                                onClose();
                            }}
                        >
                            <View style={[styles.iconWrap, { backgroundColor: option.color + '15' }]}>
                                <Ionicons name={option.icon} size={28} color={option.color} />
                            </View>
                            <ThemedText style={styles.optionLabel}>{option.label}</ThemedText>
                            <Ionicons name="chevron-forward" size={18} color={C.muted} />
                        </TouchableOpacity>
                    ))}
                </View>

                {recentHistory.length > 0 && (
                    <View style={styles.historySection}>
                        <View style={styles.historyHeader}>
                            <ThemedText style={[styles.historyTitle, { color: C.text }]}>Recent Scans</ThemedText>
                        </View>
                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false} 
                            contentContainerStyle={styles.historyScroll}
                        >
                            {recentHistory.map((item) => {
                                // Ensure we have a valid image URL (passed from parent usually)
                                const imageUrl = item.imageUrl; 
                                return (
                                    <TouchableOpacity 
                                        key={item._id || item.id} 
                                        style={[styles.historyCard, { backgroundColor: C.surface, borderColor: C.border }]}
                                        onPress={() => {
                                            onHistoryItemPress?.(item);
                                            onClose();
                                        }}
                                    >
                                        <Image source={{ uri: imageUrl }} style={styles.historyThumb} />
                                        <ThemedText style={[styles.historyName, { color: C.text }]} numberOfLines={1}>
                                            {item.diseaseName.replace(/_/g, ' ')}
                                        </ThemedText>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                )}

                <TouchableOpacity 
                    style={[styles.cancelButton, { backgroundColor: C.surface }]} 
                    activeOpacity={0.8}
                    onPress={onClose}
                >
                    <ThemedText style={[styles.cancelText, { color: C.text }]}>Cancel</ThemedText>
                </TouchableOpacity>
            </ThemedView>
        </Pressable>
    );

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            {Platform.OS === 'ios' ? (
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}>
                    {Content}
                </BlurView>
            ) : (
                Content
            )}
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        borderTopLeftRadius: Radius.xxl,
        borderTopRightRadius: Radius.xxl,
        padding: Spacing.lg,
        paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.xl,
        ...Shadows.lg,
    },
    dragHandle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: Spacing.lg,
    },
    header: {
        marginBottom: Spacing.xl,
        alignItems: 'center',
    },
    title: {
        ...Typography.h3,
        fontSize: 20,
        fontWeight: '800',
        textAlign: 'center',
    },
    description: {
        ...Typography.small,
        textAlign: 'center',
        marginTop: 6,
        lineHeight: 18,
    },
    optionsContainer: {
        gap: 12,
        marginBottom: Spacing.xl,
    },
    historySection: {
        marginBottom: Spacing.xl,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        paddingHorizontal: 4,
    },
    historyTitle: {
        fontSize: 14,
        fontWeight: '700',
    },
    historyScroll: {
        gap: 12,
        paddingBottom: 4,
    },
    historyCard: {
        width: 100,
        borderRadius: Radius.md,
        borderWidth: 1,
        overflow: 'hidden',
    },
    historyThumb: {
        width: '100%',
        height: 70,
        backgroundColor: '#EEE',
    },
    historyName: {
        fontSize: 10,
        fontWeight: '700',
        padding: 6,
        textAlign: 'center',
        textTransform: 'capitalize',
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: Radius.lg,
        borderWidth: 1,
        gap: 16,
    },
    iconWrap: {
        width: 52,
        height: 52,
        borderRadius: Radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionLabel: {
        flex: 1,
        ...Typography.h4,
        fontSize: 16,
    },
    cancelButton: {
        paddingVertical: 16,
        borderRadius: Radius.lg,
        alignItems: 'center',
    },
    cancelText: {
        fontWeight: '700',
        fontSize: 16,
    },
});
