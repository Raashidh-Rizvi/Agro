import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View, TextInput, ActivityIndicator, RefreshControl, Alert, Modal, ScrollView, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppColors } from '@/context/AppThemeContext';
import { Radius, Spacing, Shadows } from '@/constants/theme';
import { ProduceService, ProduceListing } from '@/services/ProduceService';
import { BASE_URL } from '@/constants/Config';
import { useAuth } from '@/context/AuthContext';

const CATEGORIES = ['All', 'Seeds', 'Fertilizers', 'Tools', 'Pesticides', 'Other'];
const FORM_CATEGORIES = ['Seeds', 'Fertilizers', 'Tools', 'Pesticides', 'Other'];
type Category = (typeof CATEGORIES)[number];

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  category: 'Seeds',
  imageUri: '',
};

export default function MarketplaceScreen() {
  const C = useAppColors();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [products, setProducts] = useState<ProduceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchProducts = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const data = await ProduceService.getAll(activeCategory, search);
      setProducts(data);
    } catch (error: any) {
      console.error('Fetch products error:', error);
      Alert.alert('Error', error.message || 'Could not load products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeCategory, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 500); // Debounce search
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts(false);
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setForm({ ...form, imageUri: result.assets[0].uri });
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.description || !form.price || !form.category) {
      Alert.alert('Validation', 'Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await ProduceService.update(editingId, {
          name: form.name,
          description: form.description,
          price: parseFloat(form.price),
          category: form.category,
        }, form.imageUri.startsWith('http') ? undefined : form.imageUri);
        Alert.alert('Success', 'Listing updated successfully');
      } else {
        await ProduceService.create({
          name: form.name,
          description: form.description,
          price: parseFloat(form.price),
          category: form.category,
        }, form.imageUri);
        Alert.alert('Success', 'Listing created successfully');
      }
      setModalVisible(false);
      fetchProducts(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save listing');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (item: ProduceListing) => {
    setEditingId(item._id);
    setForm({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      imageUri: item.imageUrl ? (item.imageUrl.startsWith('http') ? item.imageUrl : `${BASE_URL}${item.imageUrl}`) : '',
    });
    setModalVisible(true);
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalVisible(true);
  };

  const renderProduct = ({ item }: { item: ProduceListing }) => (
    <TouchableOpacity style={[styles.card, { backgroundColor: C.card, borderColor: C.border }]} activeOpacity={0.9}>
      <View style={[styles.imageArea, { backgroundColor: C.surface }]}>
        {item.imageUrl ? (
          <Image 
            source={{ uri: item.imageUrl.startsWith('http') ? item.imageUrl : `${BASE_URL}${item.imageUrl}` }} 
            style={styles.productImage} 
          />
        ) : (
          <Ionicons name="image-outline" size={32} color={C.muted} />
        )}
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
        <ThemedText style={[styles.sellerName, { color: C.muted }]}>by {item.sellerName}</ThemedText>
        <View style={styles.priceRow}>
          <ThemedText style={[styles.price, { color: C.primary }]}>Rs. {item.price.toLocaleString()}</ThemedText>
          <View style={[styles.ratingPill, { backgroundColor: C.surface }]}>
            <Ionicons name="star" size={11} color="#F59E0B" />
            <ThemedText style={[styles.ratingText, { color: C.subtext }]}>{item.rating}</ThemedText>
          </View>
        </View>
        
        {item.userId === user?.id || item.userId === user?._id ? (
          <View style={styles.ownerActions}>
            <TouchableOpacity 
              style={[styles.editBtn, { borderColor: C.border }]}
              onPress={() => openEdit(item)}
            >
              <Ionicons name="create-outline" size={14} color={C.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.deleteBtn, { borderColor: C.border }]}
              onPress={() => {
                Alert.alert('Delete', 'Are you sure?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: async () => {
                    try {
                      await ProduceService.delete(item._id);
                      fetchProducts(false);
                    } catch (e: any) {
                      Alert.alert('Error', e.message);
                    }
                  }}
                ]);
              }}
            >
              <Ionicons name="trash-outline" size={14} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={[styles.addBtn, { backgroundColor: C.primary }]} activeOpacity={0.8}>
            <Ionicons name="add" size={15} color="#FFFFFF" />
            <ThemedText style={styles.addBtnText}>Add to Cart</ThemedText>
          </TouchableOpacity>
        )}
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
          <ThemedText style={[styles.headerSubtitle, { color: C.muted }]}>{products.length} products available</ThemedText>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.sellBtn, Shadows.colored(C.primary)]} 
            activeOpacity={0.85}
            onPress={openAdd}
          >
            <Ionicons name="add-circle-outline" size={16} color="#FFFFFF" />
            <ThemedText style={styles.sellBtnText}>Sell</ThemedText>
          </TouchableOpacity>
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
      <View style={styles.categoriesRow}>
        <FlatList
          data={CATEGORIES as unknown as Category[]}
          keyExtractor={(item) => item}
          horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
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
      </View>

      {/* Product Grid */}
      {loading && !refreshing ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : (
        <FlatList
          data={products} renderItem={renderProduct} keyExtractor={(item) => item._id}
          numColumns={2} contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper} showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[C.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="magnify-close" size={48} color={C.muted} />
              <ThemedText style={[styles.emptyText, { color: C.muted }]}>No products found</ThemedText>
            </View>
          }
        />
      )}

      {/* Create / Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: C.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={[styles.modalTitle, { color: C.text }]}>{editingId ? 'Edit Listing' : 'Sell Produce'}</ThemedText>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={C.muted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity style={[styles.imagePicker, { backgroundColor: C.surface, borderColor: C.border }]} onPress={handlePickImage}>
                {form.imageUri ? (
                  <Image source={{ uri: form.imageUri }} style={styles.pickerImage} />
                ) : (
                  <View style={styles.pickerPlaceholder}>
                    <Ionicons name="camera-outline" size={32} color={C.primary} />
                    <ThemedText style={{ color: C.muted, marginTop: 8 }}>Add Product Image</ThemedText>
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Product Name *</ThemedText>
                <TextInput 
                  style={[styles.input, { backgroundColor: C.bg, color: C.text, borderColor: C.border }]}
                  value={form.name}
                  onChangeText={v => setForm({...form, name: v})}
                  placeholder="e.g. Organic Tomato"
                  placeholderTextColor={C.muted}
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Category *</ThemedText>
                <View style={styles.formCategories}>
                  {FORM_CATEGORIES.map(cat => (
                    <TouchableOpacity 
                      key={cat}
                      style={[styles.catPill, { backgroundColor: form.category === cat ? C.primary : C.surface, borderColor: C.border }]}
                      onPress={() => setForm({...form, category: cat})}
                    >
                      <ThemedText style={{ color: form.category === cat ? '#FFF' : C.subtext, fontSize: 12 }}>{cat}</ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Price (Rs.) *</ThemedText>
                <TextInput 
                  style={[styles.input, { backgroundColor: C.bg, color: C.text, borderColor: C.border }]}
                  value={form.price}
                  onChangeText={v => setForm({...form, price: v})}
                  placeholder="e.g. 500"
                  placeholderTextColor={C.muted}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Description *</ThemedText>
                <TextInput 
                  style={[styles.input, styles.textArea, { backgroundColor: C.bg, color: C.text, borderColor: C.border }]}
                  value={form.description}
                  onChangeText={v => setForm({...form, description: v})}
                  placeholder="Tell buyers about your produce..."
                  placeholderTextColor={C.muted}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <TouchableOpacity 
                style={[styles.saveBtn, { backgroundColor: C.primary, opacity: saving ? 0.7 : 1 }]} 
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <ThemedText style={styles.saveBtnText}>{editingId ? 'Update Listing' : 'Post Listing'}</ThemedText>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  searchDivider: { width: 1, height: 18, marginHorizontal: 4 },
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
  cardBadgeAI: { backgroundColor: '#E6F4EA', borderColor: '#0F9D58' },
  badgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.2, color: '#4A6358' },
  badgeTextAI: { color: '#0B6B3A' },
  cardContent: { padding: 12 },
  productImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  productName: { fontWeight: '700', fontSize: 13, marginBottom: 2, lineHeight: 17 },
  sellerName: { fontSize: 11, marginBottom: 8 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  price: { fontWeight: '800', fontSize: 14 },
  ratingPill: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.pill },
  ratingText: { fontSize: 10, fontWeight: '700' },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: Radius.md },
  addBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 11 },
  ownerActions: { flexDirection: 'row', gap: 8 },
  editBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 6, borderRadius: Radius.md, borderWidth: 1 },
  deleteBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 6, borderRadius: Radius.md, borderWidth: 1 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 15, marginTop: 12, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: Spacing.lg, height: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl },
  modalTitle: { fontSize: 22, fontWeight: '800' },
  imagePicker: { width: '100%', height: 180, borderRadius: Radius.xl, borderStyle: 'dashed', borderWidth: 2, marginBottom: Spacing.xl, overflow: 'hidden' },
  pickerPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pickerImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  inputGroup: { marginBottom: Spacing.lg },
  inputLabel: { fontSize: 13, fontWeight: '700', color: '#6B7280', marginBottom: 8 },
  input: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: Radius.lg, borderWidth: 1, fontSize: 15 },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  formCategories: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catPill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.pill, borderWidth: 1 },
  saveBtn: { borderRadius: Radius.lg, paddingVertical: 16, alignItems: 'center', marginTop: Spacing.md, marginBottom: Spacing.xl, ...Shadows.md },
  saveBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
});
