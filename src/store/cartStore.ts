import { create } from 'zustand';

interface CartItem {
  menuItemId: string;
  ad: string;
  fiyat: number;
  adet: number;
}

interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  addItem: (restaurantId: string, item: Omit<CartItem, 'adet'>) => void;
  removeItem: (menuItemId: string) => void;
  updateAdet: (menuItemId: string, adet: number) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  restaurantId: null,

  addItem: (restaurantId, item) => {
    const { items, restaurantId: currentRestaurant } = get();
    if (currentRestaurant && currentRestaurant !== restaurantId) {
      set({ items: [{ ...item, adet: 1 }], restaurantId });
      return;
    }
    const existing = items.find((i) => i.menuItemId === item.menuItemId);
    if (existing) {
      set({ items: items.map((i) => i.menuItemId === item.menuItemId ? { ...i, adet: i.adet + 1 } : i) });
    } else {
      set({ items: [...items, { ...item, adet: 1 }], restaurantId });
    }
  },

  removeItem: (menuItemId) =>
    set((s) => ({ items: s.items.filter((i) => i.menuItemId !== menuItemId) })),

  updateAdet: (menuItemId, adet) =>
    set((s) => ({
      items: adet <= 0
        ? s.items.filter((i) => i.menuItemId !== menuItemId)
        : s.items.map((i) => i.menuItemId === menuItemId ? { ...i, adet } : i),
    })),

  clearCart: () => set({ items: [], restaurantId: null }),

  total: () => get().items.reduce((sum, i) => sum + i.fiyat * i.adet, 0),
}));
