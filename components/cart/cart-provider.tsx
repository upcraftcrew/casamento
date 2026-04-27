"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Id } from "@/convex/_generated/dataModel";

export type CartItem = {
  giftId: Id<"gifts">;
  titulo: string;
  categoria: string;
  preco: number;
  imagem?: string;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  has: (giftId: Id<"gifts">) => boolean;
  add: (item: CartItem) => void;
  remove: (giftId: Id<"gifts">) => void;
  clear: () => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const STORAGE_KEY = "casamento-cart-v1";

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setItems(parsed);
        }
      }
    } catch {
      // ignora
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignora
    }
  }, [items, hydrated]);

  const has = useCallback(
    (giftId: Id<"gifts">) => items.some((it) => it.giftId === giftId),
    [items]
  );

  const add = useCallback((item: CartItem) => {
    setItems((prev) => {
      if (prev.some((it) => it.giftId === item.giftId)) return prev;
      return [...prev, item];
    });
  }, []);

  const remove = useCallback((giftId: Id<"gifts">) => {
    setItems((prev) => prev.filter((it) => it.giftId !== giftId));
  }, []);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const total = useMemo(
    () => items.reduce((sum, it) => sum + it.preco, 0),
    [items]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.length,
      total,
      has,
      add,
      remove,
      clear,
      isOpen,
      open: () => setOpen(true),
      close: () => setOpen(false),
    }),
    [items, total, has, add, remove, clear, isOpen]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart deve ser usado dentro de <CartProvider>.");
  }
  return ctx;
}
