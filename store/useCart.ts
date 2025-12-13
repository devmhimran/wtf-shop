import { CartCustomization } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: number;
  slug: string;
  quantity: number;
  image: string;
  color: string;
  size: string;
  printSide: 'one' | 'two';
  customizations?: CartCustomization[];
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: number, size: string, color: string) => void;
  updateQty: (
    productId: number,
    size: string,
    color: string,
    qty: number
  ) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          // Check if same variant already exists (same product, size, color, printSide)
          const existingIndex = state.items.findIndex(
            (i) =>
              i.productId === item.productId &&
              i.size === item.size &&
              i.color === item.color &&
              i.printSide === item.printSide
          );

          if (existingIndex !== -1) {
            // Update quantity if variant already exists
            const updatedItems = [...state.items];
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity: updatedItems[existingIndex].quantity + item.quantity,
              // Update customizations if new ones are provided
              customizations: item.customizations?.length
                ? item.customizations
                : updatedItems[existingIndex].customizations,
            };
            return { items: updatedItems };
          }

          // Add new variant to cart
          return { items: [...state.items, item] };
        }),

      updateQty: (productId, size, color, qty) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId &&
            item.size === size &&
            item.color === color
              ? { ...item, quantity: qty }
              : item
          ),
        })),

      removeItem: (productId, size, color) =>
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(
                item.productId === productId &&
                item.size === size &&
                item.color === color
              )
          ),
        })),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage', // localStorage key
    }
  )
);
