import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, View, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput, Modal, Pressable } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { useAppColors } from '@/context/AppThemeContext';
import { Shadows, Radius, Spacing, Typography } from '@/constants/theme';
import { MarketPriceService, MarketPrice } from '@/services/MarketPriceService';

const DISTRICTS = [
    'All Districts', 'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya', 
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar', 
    'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee', 
    'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla', 
    'Moneragala', 'Ratnapura', 'Kegalle'
].sort((a, b) => a === 'All Districts' ? -1 : b === 'All Districts' ? 1 : a.localeCompare(b));

export default function MarketInsightScreen() {
    const { user } = useAuth();
    const C = useAppColors();
    const router = useRouter();

    const [prices, setPrices] = useState<MarketPrice[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [districtFilter, setDistrictFilter] = useState('All Districts');
    const [showDistrictModal, setShowDistrictModal] = useState(false);

    const isAdmin = user?.role === 'Admin';

    useEffect(() => {
        fetchPrices();
    }, []);

    const fetchPrices = async () => {
        try {
            setLoading(true);
            const data = await MarketPriceService.getAll();
            setPrices(data);
        } catch (error) {
            console.error('Error fetching prices:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchPrices();
    };

    const filteredPrices = prices.filter(item => 
        item.cropName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (districtFilter === 'All Districts' || item.district === districtFilter)
    );

    const renderPriceCard = ({ item }: { item: MarketPrice }) => (
        <TouchableOpacity 
            style={[styles.card, { backgroundColor: C.card, borderColor: C.border }]}
            onPress={() => isAdmin && router.push({ pathname: '/(tabs)/market-insight/manage', params: { id: item._id } })}
        >
            <View style={styles.cardHeader}>
                <View style={styles.cropInfo}>
                    <ThemedText style={styles.cropName}>{item.cropName}</ThemedText>
                    <View style={styles.districtBadge}>
                        <Ionicons name="location-outline" size={12} color={C.primary} />
                        <ThemedText style={[styles.districtText, { color: C.primary }]}>{item.district}</ThemedText>
                    </View>
                </View>
                <View style={styles.priceContainer}>
                    <ThemedText style={[styles.priceText, { color: C.text }]}>Rs. {item.price}</ThemedText>
                    <ThemedText style={[styles.unitText, { color: C.muted }]}>/ {item.unit}</ThemedText>
                </View>
            </View>
            
            <View style={styles.cardFooter}>
                <View style={styles.trendInfo}>
                    <Ionicons 
                        name={item.trend === 'up' ? 'trending-up' : item.trend === 'down' ? 'trending-down' : 'remove'} 
                        size={16} 
                        color={item.trend === 'up' ? '#10B981' : item.trend === 'down' ? '#EF4444' : '#6B7280'} 
                    />
                    <ThemedText style={[styles.trendText, { 
                        color: item.trend === 'up' ? '#10B981' : item.trend === 'down' ? '#EF4444' : '#6B7280' 
                    }]}>
                        {item.trend === 'up' ? 'Rising' : item.trend === 'down' ? 'Falling' : 'Stable'}
                    </ThemedText>
                </View>
                <ThemedText style={[styles.dateText, { color: C.muted }]}>
                    {new Date(item.date).toLocaleDateString()}
                </ThemedText>
            </View>
        </TouchableOpacity>
    );

    return (
        <ThemedView style={[styles.container, { backgroundColor: C.bg }]}>
            <View style={[styles.header, { borderBottomColor: C.border }]}>
                <ThemedText style={styles.headerTitle}>Market Insight</ThemedText>
                {isAdmin && (
                    <TouchableOpacity 
                        style={[styles.addButton, { backgroundColor: C.primary }]}
                        onPress={() => router.push('/(tabs)/market-insight/manage')}
                    >
                        <Ionicons name="add" size={24} color="#FFF" />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.filterContainer}>
                <View style={[styles.searchBar, { backgroundColor: C.card, borderColor: C.border }]}>
                    <Ionicons name="search" size={20} color={C.muted} />
                    <TextInput 
                        style={[styles.searchInput, { color: C.text }]}
                        placeholder="Search crops..."
                        placeholderTextColor={C.muted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <TouchableOpacity 
                    style={[styles.searchBar, { backgroundColor: C.card, borderColor: C.border, marginLeft: 10, flex: 0.7 }]}
                    onPress={() => setShowDistrictModal(true)}
                >
                    <Ionicons name="location" size={18} color={C.primary} />
                    <ThemedText 
                        style={[styles.districtPlaceholder, { color: districtFilter === 'All Districts' ? C.muted : C.text }]}
                        numberOfLines={1}
                    >
                        {districtFilter}
                    </ThemedText>
                    <Ionicons name="chevron-down" size={16} color={C.muted} />
                </TouchableOpacity>
            </View>

            {loading && !refreshing ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={C.primary} />
                </View>
            ) : filteredPrices.length === 0 ? (
                <View style={styles.centerContainer}>
                    <MaterialCommunityIcons name="store-off-outline" size={64} color={C.muted} />
                    <ThemedText style={[styles.emptyText, { color: C.muted }]}>No market insights found</ThemedText>
                </View>
            ) : (
                <FlatList
                    data={filteredPrices}
                    renderItem={renderPriceCard}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={C.primary} />
                    }
                />
            )}

            {/* District Selector Modal */}
            <Modal
                visible={showDistrictModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowDistrictModal(false)}
            >
                <Pressable 
                    style={styles.modalOverlay} 
                    onPress={() => setShowDistrictModal(false)}
                >
                    <ThemedView style={[styles.modalContent, { backgroundColor: C.card }]}>
                        <View style={styles.modalHeader}>
                            <ThemedText style={styles.modalTitle}>Select District</ThemedText>
                            <TouchableOpacity onPress={() => setShowDistrictModal(false)}>
                                <Ionicons name="close" size={24} color={C.text} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={DISTRICTS}
                            keyExtractor={item => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={[
                                        styles.districtOption, 
                                        { borderBottomColor: C.border },
                                        districtFilter === item && { backgroundColor: C.primary + '15' }
                                    ]}
                                    onPress={() => {
                                        setDistrictFilter(item);
                                        setShowDistrictModal(false);
                                    }}
                                >
                                    <ThemedText style={[
                                        styles.districtOptionText, 
                                        districtFilter === item && { color: C.primary, fontWeight: '700' }
                                    ]}>{item}</ThemedText>
                                    {districtFilter === item && <Ionicons name="checkmark" size={20} color={C.primary} />}
                                </TouchableOpacity>
                            )}
                        />
                    </ThemedView>
                </Pressable>
            </Modal>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.xxl + Spacing.sm,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
    },
    headerTitle: { ...Typography.h1, fontSize: 24 },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.sm,
    },
    filterContainer: {
        flexDirection: 'row',
        padding: Spacing.md,
        alignItems: 'center',
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        height: 44,
        borderRadius: Radius.md,
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        marginLeft: Spacing.sm,
        fontSize: 14,
    },
    districtPlaceholder: {
        flex: 1,
        marginLeft: Spacing.sm,
        fontSize: 13,
        fontWeight: '600',
    },
    listContent: {
        padding: Spacing.md,
        paddingBottom: Spacing.xxl,
    },
    card: {
        borderRadius: Radius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        borderWidth: 1,
        ...Shadows.sm,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.md,
    },
    cropInfo: { flex: 1 },
    cropName: { fontSize: 18, fontWeight: '700' },
    districtBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    districtText: { fontSize: 12, marginLeft: 2, fontWeight: '600' },
    priceContainer: { alignItems: 'flex-end' },
    priceText: { fontSize: 20, fontWeight: '800' },
    unitText: { fontSize: 12, marginTop: 2 },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        paddingTop: Spacing.sm,
    },
    trendInfo: { flexDirection: 'row', alignItems: 'center' },
    trendText: { fontSize: 12, fontWeight: '700', marginLeft: 4 },
    dateText: { fontSize: 11 },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xxl,
    },
    emptyText: { marginTop: Spacing.md, fontSize: 16, textAlign: 'center' },
    
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: '70%',
        borderTopLeftRadius: Radius.xl,
        borderTopRightRadius: Radius.xl,
        padding: Spacing.lg,
        ...Shadows.lg,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
        paddingBottom: Spacing.sm,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
    },
    districtOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: Spacing.sm,
        borderBottomWidth: 1,
    },
    districtOptionText: {
        fontSize: 16,
        fontWeight: '500',
    },
});
