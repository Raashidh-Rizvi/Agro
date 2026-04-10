import React, { useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View, TextInput } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '../../context/AuthContext';
import { useAppColors } from '@/context/AppThemeContext';
import { Shadows, Radius, Spacing } from '@/constants/theme';

const CATEGORIES = ['All', 'Fertilizers', 'Seeds', 'Tools', 'Pesticides'] as const;
type Category = typeof CATEGORIES[number];

const PRODUCTS = [
  { id: '1', name: 'Organic Fertilizer',    price: 'Rs. 2,500', seller: 'Green Agro',  rating: 4.8, category: 'Fertilizers' as Category, icon: 'leaf'              as const, badge: 'Best Seller' },
  { id: '2', name: 'Paddy Seeds (Premium)', price: 'Rs. 1,800', seller: 'Lanka Seeds', rating: 4.5, category: 'Seeds'       as Category, icon: 'seed-outline'       as const, badge: 'AI Pick'     },
  { id: '3', name: 'Sprayer Pump',           price: 'Rs. 5,200', seller: 'AgriTools',  rating: 4.2, category: 'Tools'       as Category, icon: 'spray'              as const, badge: null          },
  { id: '4', name: 'Natural Pesticide',      price: 'Rs. 1,200', seller: 'BioFarm',    rating: 4.7, category: 'Pesticides'  as Category, icon: 'shield-bug-outline' as const, badge: 'Eco-Safe'    },
  { id: '5', name: 'Drip Irrigation Kit',    price: 'Rs. 8,900', seller: 'WaterWise',  rating: 4.9, category: 'Tools'       as Category, icon: 'water-pump'         as const, badge: 'AI Pick'     },
  { id: '6', name: 'Compost Fertilizer',     price: 'Rs. 950',   seller: 'EcoFarm',    rating: 4.3, category: 'Fertilizers' as Category, icon: 'recycle'            as const, badge: null          },
];

export default function MarketplaceScreen() {
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [search, setSearch] = useState('');
  const C = useAppColors();

  const filtered = PRODUCTS.filter((p) => {
    const matchCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const renderProduct = ({ item }: { item: typeof PRODUCTS[0] }) => (
    <TouchableOpacity style={[styles.card, { backgroundColor: C.card, borderColor: C.border }]} activeOpacity={0.85}>
      <View style={[styles.imageArea, { backgroundColor: C.primaryDim }]}>
        <MaterialCommunityIcons name={item.icon} size={44} color={C.primary} />
        {item.badge && (
          <View style={[styles.cardBadge, { backgroundColor: C.card, borderColor: C.border },
            item.badge === 'AI Pick' && styles.cardBadgeAI]}>
            {item.badge === 'AI Pick' && <MaterialCommunityIcons name="chip" size={9} color="#0B6B3A" />}
            <ThemedText style={[styles.badgeText, item.badge === 'AI Pick' && styles.badgeTextAI]}>
              {item.badge}
            </ThemedText>
          </View>
        )}
      </View>
      <View style={styles.cardContent}>
        <ThemedText style={[styles.productName, { color: C.text }]} numberOfLines={2}>{item.name}</ThemedText>
        <ThemedText style={[styles.sellerName, { color: C.muted }]}>by {item.seller}</ThemedText>
        <View style={styles.priceRow}>
          <ThemedText style={[styles.price, { color: C.primary }]}>{item.price}</ThemedText>
          <View style={[styles.ratingPill, { backgroundColor: C.surface }]}>
            <Ionicons name="star" size={11} color="#F59E0B" />
            <ThemedText style={[styles.ratingText, { color: C.subtext }]}>{item.rating}</ThemedText>
          </View>
        </View>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: C.primary }]} activeOpacity={0.8}>
          <Ionicons name="add" size={15} color="#FFFFFF" />
          <ThemedText style={styles.addBtnText}>Add to Cart</ThemedText>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor: C.bg }]}>
      <StatusBar style={C.statusBar} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <ThemedText style={[styles.headerTitle, { color: C.text }]}>Marketplace</ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: C.muted }]}>{filtered.length} products available</ThemedText>
        </View>
        <View style={styles.headerActions}>
          {/* Sell button */}
          <TouchableOpacity style={[styles.sellBtn, Shadows.colored(C.primary)]} activeOpacity={0.85}>
            <Ionicons name="add-circle-outline" size={16} color="#FFFFFF" />
            <ThemedText style={styles.sellBtnText}>Sell</ThemedText>
          </TouchableOpacity>
          {/* Cart */}
          <TouchableOpacity style={[styles.cartBtn, { backgroundColor: C.card, borderColor: C.border }]}>
            <Ionicons name="cart-outline" size={22} color={C.primary} />
            <View style={styles.cartBadge}>
              <ThemedText style={styles.cartBadgeText}>3</ThemedText>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: C.card, borderColor: C.border }]}>
        <Ionicons name="search-outline" size={18} color={C.muted} />
        <TextInput style={[styles.searchInput, { color: C.text }]}
          placeholder="Search products…" placeholderTextColor={C.muted}
          value={search} onChangeText={setSearch} />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={C.muted} />
          </TouchableOpacity>
        )}
        <View style={[styles.searchDivider, { backgroundColor: C.border }]} />
        <TouchableOpacity>
          <Ionicons name="options-outline" size={18} color={C.primary} />
        </TouchableOpacity>
      </View>

      {/* Category Pills */}
      <FlatList
        data={CATEGORIES as unknown as Category[]}
        keyExtractor={(item) => item}
        horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContent}
        style={styles.categoriesRow}
        renderItem={({ item }) => {
          const active = item === activeCategory;
          return (
            <TouchableOpacity
              style={[styles.pill, { backgroundColor: active ? C.primary : C.card, borderColor: active ? C.primary : C.border }]}
              onPress={() => setActiveCategory(item)} activeOpacity={0.8}
            >
              <ThemedText style={[styles.pillText, { color: active ? '#FFFFFF' : C.subtext, fontWeight: active ? '700' : '600' }]}>
                {item}
              </ThemedText>
            </TouchableOpacity>
          );
        }}
      />

      {/* Product Grid */}
      <FlatList
        data={filtered} renderItem={renderProduct} keyExtractor={(item) => item.id}
        numColumns={2} contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper} showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="magnify-close" size={48} color={C.muted} />
            <ThemedText style={[styles.emptyText, { color: C.muted }]}>No products found</ThemedText>
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: Spacing.xxl + Spacing.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  headerTitle: { fontSize: 26, fontWeight: '800', letterSpacing: -0.3 },
  headerSubtitle: { fontSize: 12, marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sellBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#0F9D58', paddingHorizontal: 14, paddingVertical: 9, borderRadius: Radius.pill,
  },
  sellBtnText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  cartBtn: { padding: 10, borderRadius: Radius.sm, borderWidth: 1, position: 'relative', ...Shadows.xs },
  cartBadge: {
    position: 'absolute', top: 5, right: 5, width: 16, height: 16,
    borderRadius: 8, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center',
  },
  cartBadgeText: { fontSize: 9, fontWeight: '800', color: '#FFFFFF' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: Spacing.lg,
    paddingHorizontal: Spacing.md, paddingVertical: 10,
    borderRadius: Radius.lg, marginBottom: Spacing.md, gap: 8, borderWidth: 1, ...Shadows.xs,
  },
  searchInput: { flex: 1, fontSize: 14 },
  searchDivider: { width: 1, height: 18 },
  categoriesRow: { marginBottom: Spacing.md },
  categoriesContent: { paddingHorizontal: Spacing.lg, gap: 8 },
  pill: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: Radius.pill, borderWidth: 1 },
  pillText: { fontSize: 13 },
  listContent: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xl },
  columnWrapper: { justifyContent: 'space-between', marginBottom: 14 },
  card: { width: '48%', borderRadius: Radius.xl, overflow: 'hidden', borderWidth: 1, ...Shadows.sm },
  imageArea: { width: '100%', height: 100, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  cardBadge: {
    position: 'absolute', top: 8, left: 8, flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: Radius.pill, borderWidth: 1,
  },
  cardBadgeAI: { backgroundColor: '#A8E063', borderColor: '#A8E063' },
  badgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.2, color: '#4A6358' },
  badgeTextAI: { color: '#0B6B3A' },
  cardContent: { padding: 12 },
  productName: { fontWeight: '700', fontSize: 13, marginBottom: 2, lineHeight: 17 },
  sellerName: { fontSize: 11, marginBottom: 8 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  price: { fontWeight: '800', fontSize: 14 },
  ratingPill: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.pill },
  ratingText: { fontSize: 10, fontWeight: '700' },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: Radius.md },
  addBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 11 },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 15, marginTop: 12, fontWeight: '600' },
});
