import api from './api';

export interface CartItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl?: string;
    sellerName: string;
}

export interface Cart {
    items: CartItem[];
    totalAmount: number;
}

export const CartService = {
    /**
     * Transform backend response to Cart interface
     */
    transformCart: (data: any): Cart => {
        if (!data || !data.items) return { items: [], totalAmount: 0 };
        
        const items = data.items.map((item: any) => ({
            productId: item.productId._id || item.productId,
            name: item.productId.name || 'Unknown Product',
            price: item.productId.price || 0,
            quantity: item.quantity,
            imageUrl: item.productId.imageUrl,
            sellerName: item.productId.sellerName || 'Unknown Seller'
        }));

        const totalAmount = items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);

        return { items, totalAmount };
    },

    /**
     * Fetch current user's cart
     */
    getCart: async (): Promise<Cart> => {
        const response = await api.get('/cart');
        if (response.data.success) {
            return CartService.transformCart(response.data.data);
        } else {
            throw new Error(response.data.message || 'Failed to fetch cart');
        }
    },

    /**
     * Add an item to the cart
     */
    addToCart: async (productId: string, quantity: number = 1): Promise<Cart> => {
        const response = await api.post('/cart/add', { productId, quantity });
        if (response.data.success) {
            return CartService.transformCart(response.data.data);
        } else {
            throw new Error(response.data.message || 'Failed to add to cart');
        }
    },

    /**
     * Update item quantity in cart
     */
    updateQuantity: async (productId: string, quantity: number): Promise<Cart> => {
        const response = await api.put('/cart/update', { productId, quantity });
        if (response.data.success) {
            return CartService.transformCart(response.data.data);
        } else {
            throw new Error(response.data.message || 'Failed to update quantity');
        }
    },

    /**
     * Remove an item from the cart
     */
    removeFromCart: async (productId: string): Promise<Cart> => {
        const response = await api.delete(`/cart/remove/${productId}`);
        if (response.data.success) {
            return CartService.transformCart(response.data.data);
        } else {
            throw new Error(response.data.message || 'Failed to remove from cart');
        }
    },

    /**
     * Clear the cart
     */
    clearCart: async (): Promise<void> => {
        const response = await api.delete('/cart/clear');
        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to clear cart');
        }
    }
};
