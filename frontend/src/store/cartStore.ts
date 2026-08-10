import { create } from 'zustand';
import api from '../utils/api';

interface CartItem {
  id: string;
  cartId: string;
  productId: string | null;
  hamperId: string | null;
  quantity: number;
  customizations: string | null;
  product?: any;
  hamper?: any;
}

interface CartState {
  cart: { id: string; items: CartItem[] } | null;
  loading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string | null, hamperId: string | null, quantity: number, customizations?: string) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  loading: false,
  error: null,

  fetchCart: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<any>('/orders/cart');
      set({ cart: res, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  addToCart: async (productId, hamperId, quantity, customizations) => {
    set({ loading: true, error: null });
    try {
      await api.post('/orders/cart', { productId, hamperId, quantity, customizations });
      const res = await api.get<any>('/orders/cart');
      set({ cart: res, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
      throw e;
    }
  },

  removeFromCart: async (itemId) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/orders/cart/${itemId}`);
      const res = await api.get<any>('/orders/cart');
      set({ cart: res, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  clearCart: () => {
    set({ cart: null });
  },
}));
export default useCartStore;
