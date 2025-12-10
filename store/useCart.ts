import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { QuantityDiscountType } from '@/types';

export interface CartItem {
  id: string;
  productId: number;
  catalogId: string | null;
  quantity: number;
  image: string;
  title: string;
  price: number;
  color: string;
  size: string;
  printSide?: 'one' | 'two';
  customizations?: Array<{
    id: string;
    imagePreview: string; // base64 data URL
    imageName: string;
    imageSize: number;
    imageType: string;
    note: string;
  }>;
  customizationKey?: string;
  quantityDiscounts?: QuantityDiscountType[];
  applicableDiscount?: QuantityDiscountType | null;
  productType: 'STANDARD' | 'CUSTOM';
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

// Helper function to convert base64 back to File for uploading
export const base64ToFile = (
  base64: string,
  filename: string,
  mimeType: string
): File => {
  const arr = base64.split(',');
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mimeType });
};

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => ({
          items: [...state.items, item],
        }));
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          let itemTotal = item.price * item.quantity;

          // Apply discount if applicable
          if (item.applicableDiscount) {
            itemTotal -= item.applicableDiscount.amount;
          }

          return total + itemTotal;
        }, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
