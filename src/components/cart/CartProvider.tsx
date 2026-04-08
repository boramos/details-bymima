"use client";

import { createContext, useContext, useEffect, useMemo, useReducer } from "react";

import type { CartItem } from "@/lib/cart";
import { CART_STORAGE_KEY, getCartCount, getCartSubtotalCop } from "@/lib/cart";

type CartState = {
  items: CartItem[];
  isHydrated: boolean;
};

type CartAction =
  | { type: "hydrate"; payload: CartItem[] }
  | { type: "add"; payload: CartItem }
  | { type: "remove"; payload: { itemId: string } }
  | { type: "updateQuantity"; payload: { itemId: string; quantity: number } }
  | { type: "clear" };

type CartContextValue = {
  items: CartItem[];
  isHydrated: boolean;
  itemCount: number;
  subtotalCop: number;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "hydrate":
      return { items: action.payload, isHydrated: true };
    case "add": {
      const existing = state.items.find((item) => item.id === action.payload.id);

      if (existing) {
        return state;
      }

      return { ...state, items: [...state.items, action.payload] };
    }
    case "remove":
      return { ...state, items: state.items.filter((item) => item.id !== action.payload.itemId) };
    case "updateQuantity":
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((item) => item.id !== action.payload.itemId),
        };
      }

      return {
        ...state,
        items: state.items
          .map((item) =>
            item.id === action.payload.itemId
              ? { ...item, quantity: action.payload.quantity }
              : item,
          )
          .filter((item) => item.quantity > 0),
      };
    case "clear":
      return { ...state, items: [] };
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isHydrated: false });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as CartItem[]) : [];
      dispatch({ type: "hydrate", payload: parsed });
    } catch {
      dispatch({ type: "hydrate", payload: [] });
    }
  }, []);

  useEffect(() => {
    if (!state.isHydrated) {
      return;
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
  }, [state.isHydrated, state.items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items: state.items,
      isHydrated: state.isHydrated,
      itemCount: getCartCount(state.items),
      subtotalCop: getCartSubtotalCop(state.items),
      addItem: (item) => dispatch({ type: "add", payload: item }),
      removeItem: (itemId) => dispatch({ type: "remove", payload: { itemId } }),
      updateQuantity: (itemId, quantity) => dispatch({ type: "updateQuantity", payload: { itemId, quantity } }),
      clearCart: () => dispatch({ type: "clear" }),
    }),
    [state.isHydrated, state.items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
