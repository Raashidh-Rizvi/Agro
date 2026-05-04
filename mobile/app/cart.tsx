import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View, ActivityIndicator, RefreshControl, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppColors } from '@/context/AppThemeContext';
import { Radius, Spacing, Shadows, Typography } from '@/constants/theme';
import { CartService, Cart, CartItem } from '@/services/CartService';
import { BASE_URL } from '@/constants/Config';
import ValidationModal from '@/components/ValidationModal';

export default function CartScreen() {
  const C = useAppColors();
  const router = useRouter();
  
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
      title: string;
      message: string;
      type: 'error' | 'success' | 'confirm';
      onConfirm?: () => void;
      confirmText?: string;
  }>({
      title: '',
      message: '',
      type: 'error'
  });

  const showModal = (title: string, message: string, type: 'error' | 'success' | 'confirm' = 'error', onConfirm?: () => void, confirmText?: string) => {
      setModalConfig({ title, message, type, onConfirm, confirmText });
      setModalVisible(true);
  };

  const fetchCart = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const data = await CartService.getCart();
      setCart(data);
    } catch (error: any) {
      console.error('Fetch cart error:', error);
      showModal('Error', error.message || 'Could not load cart');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCart(false);
  };

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setProcessingId(productId);
    try {
      const updatedCart = await CartService.updateQuantity(productId, newQuantity);
      setCart(updatedCart);
    } catch (error: any) {
      showModal('Error', error.message || 'Failed to update quantity');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRemove = async (productId: string) => {
    const performRemove = async () => {
      setProcessingId(productId);
      try {
        const updatedCart = await CartService.removeFromCart(productId);
        setCart(updatedCart);
      } catch (error: any) {
        showModal('Error', error.message || 'Failed to remove item');
      } finally {
        setProcessingId(null);
      }
    };

    showModal(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      'confirm',
      performRemove,
      'Remove'
    );
  };

  const handleCheckout = () => {
    const performCheckout = async () => {
      try {
        await CartService.clearCart();
        setCart(null);
        showModal('Success', 'Order placed successfully!', 'success', () => router.back());
      } catch (error: any) {
        showModal('Error', error.message || 'Checkout failed');
      }
    };

    showModal(
      'Checkout',
      'Proceed to payment and place order?',
      'confirm',
      performCheckout,
      'Confirm'
    );
  };

  const handleClearCart = () => {
    const performClear = async () => {
      setLoading(true);
      try {
        await CartService.clearCart();
        setCart({ userId: cart?.userId || '', items: [], totalAmount: 0 });
      } catch (error: any) {
        showModal('Error', error.message || 'Failed to clear cart');
      } finally {
        setLoading(false);
      }
    };

    showModal(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      'confirm',
      performClear,
      'Clear All'
    );
  };

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={[styles.cartItem, { backgroundColor: C.card, borderColor: C.border }]}>
      <View style={[styles.itemImageContainer, { backgroundColor: C.surface }]}>
        {item.imageUrl ? (
          <Image 
            source={{ uri: item.imageUrl.startsWith('http') ? item.imageUrl : `${BASE_URL}${item.imageUrl}` }} 
            style={styles.itemImage}
          />
        ) : (
          <Ionicons name="image-outline" size={24} color={C.muted} />
        )}
      </View>
      <View style={styles.itemInfo}>
        <ThemedText style={[styles.itemName, { color: C.text }]} numberOfLines={1}>{item.name}</ThemedText>
        <ThemedText style={[styles.sellerName, { color: C.muted }]}>by {item.sellerName}</ThemedText>
        <ThemedText style={[styles.itemPrice, { color: C.primary }]}>Rs. {item.price.toLocaleString()}</ThemedText>
        
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={[styles.qtyBtn, { borderColor: C.border }]} 
            onPress={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
            disabled={item.quantity <= 1 || processingId === item.productId}
          >
            <Ionicons name="remove" size={16} color={item.quantity <= 1 ? C.muted : C.text} />
          </TouchableOpacity>
          <ThemedText style={[styles.qtyText, { color: C.text }]}>{item.quantity}</ThemedText>
          <TouchableOpacity 
            style={[styles.qtyBtn, { borderColor: C.border }]} 
            onPress={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
            disabled={processingId === item.productId}
          >
            <Ionicons name="add" size={16} color={C.text} />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.removeBtn} 
        onPress={() => handleRemove(item.productId)}
        disabled={processingId === item.productId}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="trash-outline" size={22} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor: C.bg }]}>
      <Stack.Screen 
        options={{ 
          title: 'Your Cart',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: C.bg },
          headerTintColor: C.text,
          headerRight: () => (
            (cart && cart.items.length > 0) ? (
              <TouchableOpacity 
                onPress={handleClearCart}
                style={styles.headerClearBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="trash-outline" size={22} color="#EF4444" />
              </TouchableOpacity>
            ) : null
          )
        }} 
      />
      <StatusBar style={C.statusBar} />

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : !cart || cart.items.length === 0 ? (
        <View style={styles.centerContainer}>
          <View style={[styles.emptyIconContainer, { backgroundColor: C.surface }]}>
            <Ionicons name="cart-outline" size={64} color={C.border} />
          </View>
          <ThemedText style={[styles.emptyTitle, { color: C.text }]}>Your cart is empty</ThemedText>
          <ThemedText style={[styles.emptySubtitle, { color: C.muted }]}>Looks like you haven't added anything to your cart yet.</ThemedText>
          <TouchableOpacity 
            style={[styles.shopBtn, { backgroundColor: C.primary }]}
            onPress={() => router.back()}
          >
            <ThemedText style={styles.shopBtnText}>Start Shopping</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cart.items}
            renderItem={renderItem}
            keyExtractor={item => item.productId}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[C.primary]} />
            }
          />

          <View style={[styles.footer, { backgroundColor: C.card, borderTopColor: C.border }, Shadows.md]}>
            <View style={styles.summaryRow}>
              <ThemedText style={[styles.totalLabel, { color: C.muted }]}>Total Amount</ThemedText>
              <ThemedText style={[styles.totalAmount, { color: C.text }]}>Rs. {cart.totalAmount.toLocaleString()}</ThemedText>
            </View>
            <TouchableOpacity 
              style={[styles.checkoutBtn, { backgroundColor: C.primary }]}
              onPress={handleCheckout}
            >
              <ThemedText style={styles.checkoutBtnText}>Checkout Now</ThemedText>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </>
      )}
      <ValidationModal
        visible={modalVisible}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
        confirmText={modalConfig.confirmText}
        onClose={() => setModalVisible(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  listContent: { padding: Spacing.lg, paddingBottom: 120 },
  
  cartItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: 14,
    ...Shadows.xs,
  },
  itemImageContainer: {
    width: 80,
    height: 80,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  itemImage: { width: '100%', height: '100%' },
  itemInfo: { flex: 1, marginLeft: 14, justifyContent: 'center' },
  itemName: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  sellerName: { fontSize: 12, marginBottom: 4 },
  itemPrice: { fontSize: 15, fontWeight: '800', marginBottom: 8 },
  
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: { fontSize: 14, fontWeight: '700', minWidth: 20, textAlign: 'center' },
  removeBtn: { 
    padding: 10, 
    justifyContent: 'center', 
    alignItems: 'center',
    minWidth: 44,
    minHeight: 44
  },

  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  emptyTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: Spacing.xxl },
  shopBtn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: Radius.pill },
  shopBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl + 10,
    borderTopWidth: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  totalLabel: { fontSize: 14, fontWeight: '600' },
  totalAmount: { fontSize: 22, fontWeight: '800' },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: Radius.lg,
  },
  checkoutBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  headerClearBtn: {
    marginRight: 4,
    padding: 4,
  },
});
