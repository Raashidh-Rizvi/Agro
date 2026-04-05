import React from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function MarketplaceScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const products = [
    { id: '1', name: 'Organic Fertilizer', price: 'Rs. 2,500', seller: 'Green Agro', rating: 4.8, image: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=200' },
    { id: '2', name: 'Paddy Seeds (Premium)', price: 'Rs. 1,800', seller: 'Lanka Seeds', rating: 4.5, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200' },
    { id: '3', name: 'Sprayer Pump', price: 'Rs. 5,200', seller: 'AgriTools', rating: 4.2, image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=200' },
    { id: '4', name: 'Natural Pesticide', price: 'Rs. 1,200', seller: 'BioFarm', rating: 4.7, image: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=200' },
  ];

  const renderProduct = ({ item }: { item: typeof products[0] }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.imagePlaceholder}>
          <Ionicons name="image-outline" size={40} color="#ccc" />
      </View>
      <View style={styles.cardContent}>
        <ThemedText style={styles.productName}>{item.name}</ThemedText>
        <ThemedText style={styles.sellerName}>By {item.seller}</ThemedText>
        <View style={styles.priceRow}>
          <ThemedText style={[styles.price, { color: themeColors.tint }]}>{item.price}</ThemedText>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <ThemedText style={styles.rating}>{item.rating}</ThemedText>
          </View>
        </View>
        <TouchableOpacity style={[styles.buyButton, { backgroundColor: themeColors.tint }]}>
          <ThemedText style={styles.buyButtonText}>Add to Cart</ThemedText>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Marketplace</ThemedText>
        <TouchableOpacity style={styles.cartButton}>
          <Ionicons name="cart-outline" size={24} color={themeColors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color={themeColors.primary} />
        <ThemedText style={styles.searchText}>Search fertilizers, seeds, tools...</ThemedText>
      </View>

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0A5C36',
  },
  cartButton: {
    padding: 10,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    padding: 14,
    borderRadius: 16,
    marginBottom: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  searchText: {
    color: '#94A3B8',
    fontSize: 15,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 30,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  imagePlaceholder: {
    width: '100%',
    height: 130,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 14,
  },
  productName: {
    fontWeight: '700',
    fontSize: 15,
    color: '#1E293B',
    marginBottom: 4,
  },
  sellerName: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  price: {
    fontWeight: '800',
    fontSize: 16,
    color: '#0A5C36',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  buyButton: {
    backgroundColor: '#0A5C36',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#0A5C36',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buyButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 13,
  },
});
