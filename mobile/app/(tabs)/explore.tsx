import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View, TextInput, ActivityIndicator, RefreshControl, Modal, ScrollView, Platform } from 'react-native';
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
import { CartService } from '@/services/CartService';
import { useRouter, useFocusEffect } from 'expo-router';
import ValidationModal from '@/components/ValidationModal';

const CATEGORIES = ['All', 'Seeds', 'Fertilizers', 'Tools', 'Pesticides', 'Other'];
const FORM_CATEGORIES = ['Seeds', 'Fertilizers', 'Tools', 'Pesticides', 'Other'];
type Category = (typeof CATEGORIES)[number];

const EMPTY_FORM = { name: '', description: '', price: '', category: 'Seeds', imageUri: '' };

export default function MarketplaceScreen() {
  const C = useAppColors();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [products, setProducts] = useState<ProduceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const router = useRouter();

  const [validationVisible, setValidationVisible] = useState(false);
  const [validationConfig, setValidationConfig] = useState<{
    title: string; message: string; type: 'error' | 'success' | 'confirm'; onConfirm?: () => void; confirmText?: string;
  }>({ title: '', message: '', type: 'error' });

  const showValidation = (title: string, message: string, type: 'error' | 'success' | 'confirm' = 'error', onConfirm?: () => void, confirmText?: string) => {
    setValidationConfig({ title, message, type, onConfirm, confirmText });
    setValidationVisible(true);
  };

  const fetchCartCount = useCallback(async () => {
    try {
      const cart = await CartService.getCart();
      setCartCount(cart.items.reduce((acc, item) => acc + item.quantity, 0));
    } catch {}
  }, []);

  useFocusEffect(useCallback(() => { fetchCartCount(); }, [fetchCartCount]));

  const fetchProducts = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const data = await ProduceService.getAll(activeCategory, search);
      setProducts(data);
    } catch (error: any) {
      showValidation('Error', error.message || 'Could not load products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeCategory, search]);

  useEffect(() => {
    const timer = setTimeout(() => fetchProducts(), 500);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const onRefresh = () => { setRefreshing(true); fetchProducts(false); };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.8 });
    if (!result.canceled) setForm({ ...form, imageUri: result.assets[0].uri });
  };

  const handleSave = async () => {
    if (!form.name || !form.description || !form.price || !form.category) {
      showValidation('Validation', 'Please fill in all required fields'); return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await ProduceService.update(editingId, { name: form.name, description: form.description, price: parseFloat(form.price), category: form.category }, form.imageUri.startsWith('http') ? undefined : form.imageUri);
        showValidation('Success', 'Listing updated successfully', 'success');
      } else {
        await ProduceService.create({ name: form.name, description: form.description, price: parseFloat(form.price), category: form.category }, form.imageUri);
        showValidation('Success', 'Listing created successfully', 'success');
      }
      setModalVisible(false);
      fetchProducts(false);
    } catch (error: any) {
      showValidation('Error', error.message || 'Failed to save listing');
    } finally { setSaving(false); }
  };

  const openEdit = (item: ProduceListing) => {
    setEditingId(item._id);
    setForm({ name: item.name, description: item.description, price: item.price.toString(), category: item.category, imageUri: item.imageUrl ? (item.imageUrl.startsWith('http') ? item.imageUrl : `${BASE_URL}${item.imageUrl}`) : '' });
    setModalVisible(true);
  };

  const openAdd = () => { setEditingId(null); setForm(EMPTY_FORM); setModalVisible(true); };

  const handleAddToCart = async (item: ProduceListing) => {
    try {
      await CartService.addToCart(item._id, 1);
      showValidation('Added!', `${item.name} added to cart`, 'success');
      fetchCartCount();
    } catch (error: any) {
      showValidation('Error', error.message || 'Failed to add to cart');
    }
  };

  const renderProduct = ({ item }: { item: ProduceListing }) => (
    <TouchableOpacity style={[styles.card, { backgroundColor: C.card, borderColor: C.border }, Shadows.md]} activeOpacity={0.88}>
      <View style={[styles.imageArea, { backgroundColor: C.surface }]}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl.startsWith('http') ? item.imageUrl : `${BASE_URL}${item.imageUrl}` }} style={styles.productImage} contentFit="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={32} color={C.muted} />
          </View>
        )}
        {/* Gradient overlay at bottom of image */}
        <View style={[styles.imageGradient, { backgroundColor: C.card }]} />
        {!!item.badge && (
          <View style={[styles.cardBadge, item.badge === 'AI Pick' && styles.cardBadgeAI]}>
            {item.badge === 'AI Pick' && <MaterialCommunityIcons name="chip" size={9} color="#0B6B3A" />}
            <ThemedText style={[styles.badgeText, item.badge === 'AI Pick' && styles.badgeTextAI]}>{item.badge}</ThemedText>
          </View>
        )}
      </View>
      <View style={styles.cardContent}>
        <ThemedText style={[styles.productName, { color: C.text }]} numberOfLines={2}>{item.name}</ThemedText>
        <ThemedText style={[styles.sellerName, { color: C.muted }]}>by {item.sellerName}</ThemedText>
        <View style={styles.priceRow}>
          <View>
            <ThemedText style={[styles.priceLabel, { color: C.muted }]}>Price</ThemedText>
            <ThemedText style={[styles.price, { color: C.primary }]}>Rs. {item.price.toLocaleString()}</ThemedText>
          </View>
          <View style={[styles.ratingPill, { backgroundColor: C.surface }]}>
            <Ionicons name="star" size={11} color="#F59E0B" />
            <ThemedText style={[styles.ratingText, { color: C.subtext }]}>{item.rating}</ThemedText>
          </View>
        </View>
        {item.userId === user?.id || item.userId === user?._id ? (
          <View style={styles.ownerActions}>
            <TouchableOpacity style={[styles.editBtn, { borderColor: C.border, backgroundColor: C.surface }]} onPress={() => openEdit(item)}>
              <Ionicons name="create-outline" size={14} color={C.primary} />
              <ThemedText style={[styles.actionBtnText, { color: C.primary }]}>Edit</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.deleteBtn, { borderColor: '#EF444440', backgroundColor: '#FEE2E2' }]}
              onPress={() => showValidation('Delete', 'Are you sure?', 'confirm', async () => {
                try { await ProduceService.delete(item._id); fetchProducts(false); }
                catch (e: any) { showValidation('Error', e.message); }
              }, 'Delete')}>
              <Ionicons name="trash-outline" size={14} color="#EF4444" />
              <ThemedText style={[styles.actionBtnText, { color: '#EF4444' }]}>Delete</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={[styles.addBtn, { backgroundColor: C.primary }, Shadows.colored(C.primary)]} activeOpacity={0.82} onPress={() => handleAddToCart(item)}>
            <Ionicons name="cart-outline" size={15} color="#FFFFFF" />
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
          <TouchableOpacity style={[styles.sellBtn, Shadows.colored(C.primary)]} activeOpacity={0.85} onPress={openAdd}>
            <Ionicons name="add-circle-outline" size={16} color="#FFFFFF" />
            <ThemedText style={styles.sellBtnText}>Sell</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.cartBtn, { backgroundColor: C.card, borderColor: C.border }, Shadows.sm]} onPress={() => router.push('/cart')} activeOpacity={0.7}>
            <Ionicons name="cart-outline" size={24} color={C.primary} />
            {cartCount > 0 && (
              <View style={[styles.cartBadge, { backgroundColor: '#EF4444' }]}>
                <ThemedText style={styles.cartBadgeText}>{cartCount}</ThemedText>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Search bar */}
      <View style={[styles.searchBar, { backgroundColor: C.card, borderColor: C.border }, Shadows.xs]}>
        <View style={[styles.searchIconWrap, { backgroundColor: C.surface }]}>
          <Ionicons name="search-outline" size={18} color={C.primary} />
        </View>
        <TextInput
          style={[styles.searchInput, { color: C.text }]}
          placeholder="Search products…"
          placeholderTextColor={C.muted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={C.muted} />
          </TouchableOpacity>
        )}
        <View style={[styles.searchDivider, { backgroundColor: C.border }]} />
        <TouchableOpacity style={[styles.filterBtn, { backgroundColor: C.primaryDim }]}>
          <Ionicons name="options-outline" size={17} color={C.primary} />
        </TouchableOpacity>
      </View>

      {/* Categories */}
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
                style={[styles.pill, { backgroundColor: active ? C.primary : C.card, borderColor: active ? C.primary : C.border }, active && Shadows.colored(C.primary)]}
                onPress={() => setActiveCategory(item)} activeOpacity={0.8}>
                <ThemedText style={[styles.pillText, { color: active ? '#FFFFFF' : C.subtext, fontWeight: active ? '700' : '600' }]}>{item}</ThemedText>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {loading && !refreshing ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={C.primary} />
          <ThemedText style={[styles.loadingText, { color: C.muted }]}>Loading products…</ThemedText>
        </View>
      ) : (
        <FlatList
          data={products} renderItem={renderProduct} keyExtractor={(item) => item._id}
          numColumns={2} contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper} showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[C.primary]} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={[styles.emptyIconWrap, { backgroundColor: C.surface }]}>
                <MaterialCommunityIcons name="magnify-close" size={40} color={C.muted} />
              </View>
              <ThemedText style={[styles.emptyText, { color: C.text }]}>No products found</ThemedText>
              <ThemedText style={[styles.emptySubtext, { color: C.muted }]}>Try adjusting your search or category</ThemedText>
            </View>
          }
        />
      )}

      {/* Sell/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: C.card }]}>
            <View style={[styles.modalAccentStrip, { backgroundColor: C.primary }]} />
            <View style={styles.modalHeader}>
              <ThemedText style={[styles.modalTitle, { color: C.text }]}>{editingId ? 'Edit Listing' : 'Sell Produce'}</ThemedText>
              <TouchableOpacity style={[styles.modalCloseBtn, { backgroundColor: C.surface }]} onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={20} color={C.muted} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity style={[styles.imagePicker, { backgroundColor: C.surface, borderColor: C.border }]} onPress={handlePickImage}>
                {form.imageUri ? (
                  <Image source={{ uri: form.imageUri }} style={styles.pickerImage} contentFit="cover" />
                ) : (
                  <View style={styles.pickerPlaceholder}>
                    <View style={[styles.pickerIconWrap, { backgroundColor: C.primaryDim }]}>
                      <Ionicons name="camera-outline" size={28} color={C.primary} />
                    </View>
                    <ThemedText style={{ color: C.subtext, marginTop: 10, fontWeight: '600' }}>Add Product Photo</ThemedText>
                    <ThemedText style={{ color: C.muted, fontSize: 12, marginTop: 3 }}>Tap to browse gallery</ThemedText>
                  </View>
                )}
              </TouchableOpacity>

              {[
                { key: 'name', label: 'Product Name *', placeholder: 'e.g. Organic Tomato', keyboardType: 'default' as const },
                { key: 'price', label: 'Price (Rs.) *', placeholder: 'e.g. 500', keyboardType: 'numeric' as const },
              ].map(field => (
                <View key={field.key} style={styles.inputGroup}>
                  <ThemedText style={[styles.inputLabel, { color: C.subtext }]}>{field.label}</ThemedText>
                  <TextInput
                    style={[styles.input, { backgroundColor: C.surface, color: C.text, borderColor: C.border }]}
                    value={(form as any)[field.key]}
                    onChangeText={v => setForm({ ...form, [field.key]: v })}
                    placeholder={field.placeholder}
                    placeholderTextColor={C.muted}
                    keyboardType={field.keyboardType}
                  />
                </View>
              ))}

              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: C.subtext }]}>Category *</ThemedText>
                <View style={styles.formCategories}>
                  {FORM_CATEGORIES.map(cat => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.catPill, { backgroundColor: form.category === cat ? C.primary : C.surface, borderColor: form.category === cat ? C.primary : C.border }]}
                      onPress={() => setForm({ ...form, category: cat })}>
                      <ThemedText style={{ color: form.category === cat ? '#FFF' : C.subtext, fontSize: 12, fontWeight: '600' }}>{cat}</ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: C.subtext }]}>Description *</ThemedText>
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: C.surface, color: C.text, borderColor: C.border }]}
                  value={form.description}
                  onChangeText={v => setForm({ ...form, description: v })}
                  placeholder="Tell buyers about your produce..."
                  placeholderTextColor={C.muted}
                  multiline numberOfLines={4}
                />
              </View>

              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: C.primary, opacity: saving ? 0.7 : 1 }, Shadows.colored(C.primary)]} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color="#FFF" /> : (
                  <>
                    <Ionicons name={editingId ? 'checkmark-circle-outline' : 'cloud-upload-outline'} size={18} color="#FFF" />
                    <ThemedText style={styles.saveBtnText}>{editingId ? 'Update Listing' : 'Post Listing'}</ThemedText>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <ValidationModal
        visible={validationVisible} title={validationConfig.title} message={validationConfig.message}
        type={validationConfig.type} onConfirm={validationConfig.onConfirm} confirmText={validationConfig.confirmText}
        onClose={() => setValidationVisible(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: Spacing.xxl + Spacing.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  headerTitle: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 12, marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sellBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#0F9D58', paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radius.pill },
  sellBtnText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  cartBtn: { padding: 10, borderRadius: Radius.md, borderWidth: 1, position: 'relative' },
  cartBadge: { position: 'absolute', top: 4, right: 4, width: 17, height: 17, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  cartBadgeText: { fontSize: 9, fontWeight: '800', color: '#FFFFFF' },

  searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: Spacing.lg, borderRadius: Radius.xl, marginBottom: Spacing.md, gap: 8, borderWidth: 1, overflow: 'hidden' },
  searchIconWrap: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
  searchInput: { flex: 1, fontSize: 15, height: 52 },
  searchDivider: { width: 1, height: 20 },
  filterBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 8 },

  categoriesRow: { marginBottom: Spacing.md },
  categoriesContent: { paddingHorizontal: Spacing.lg, gap: 8 },
  pill: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: Radius.pill, borderWidth: 1 },
  pillText: { fontSize: 13 },

  listContent: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xl + 80 },
  columnWrapper: { justifyContent: 'space-between', marginBottom: 16 },

  card: { width: '48%', borderRadius: Radius.xl, overflow: 'hidden', borderWidth: 1 },
  imageArea: { width: '100%', height: 130, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  productImage: { width: '100%', height: '100%' },
  imageGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 20, opacity: 0.6 },
  cardBadge: { position: 'absolute', top: 8, left: 8, flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: Radius.pill, backgroundColor: 'rgba(255,255,255,0.90)', borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)' },
  cardBadgeAI: { backgroundColor: '#E6F4EA', borderColor: '#0F9D58' },
  badgeText: { fontSize: 9, fontWeight: '700', color: '#4A6358' },
  badgeTextAI: { color: '#0B6B3A' },
  cardContent: { padding: 12 },
  productName: { fontWeight: '700', fontSize: 13, marginBottom: 2, lineHeight: 18 },
  sellerName: { fontSize: 11, marginBottom: 8 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 },
  priceLabel: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  price: { fontWeight: '800', fontSize: 15, letterSpacing: -0.3 },
  ratingPill: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: Radius.pill },
  ratingText: { fontSize: 10, fontWeight: '700' },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 9, borderRadius: Radius.pill },
  addBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
  ownerActions: { flexDirection: 'row', gap: 6 },
  editBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 7, borderRadius: Radius.md, borderWidth: 1 },
  deleteBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 7, borderRadius: Radius.md, borderWidth: 1 },
  actionBtnText: { fontSize: 11, fontWeight: '700' },

  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 13, fontWeight: '500' },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyText: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  emptySubtext: { fontSize: 13 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalBox: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: Spacing.lg, height: '92%', overflow: 'hidden' },
  modalAccentStrip: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl },
  modalTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  modalCloseBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  imagePicker: { width: '100%', height: 180, borderRadius: Radius.xl, borderStyle: 'dashed', borderWidth: 2, marginBottom: Spacing.xl, overflow: 'hidden' },
  pickerPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pickerIconWrap: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  pickerImage: { width: '100%', height: '100%' },
  inputGroup: { marginBottom: Spacing.lg },
  inputLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  input: { paddingHorizontal: 16, paddingVertical: 14, borderRadius: Radius.lg, borderWidth: 1, fontSize: 15 },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  formCategories: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catPill: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: Radius.pill, borderWidth: 1 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: Radius.pill, paddingVertical: 17, marginTop: Spacing.md, marginBottom: Spacing.xl },
  saveBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
});
