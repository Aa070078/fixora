"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  qty: number;
};

type CartCtx = {
  items: CartItem[];
  ready: boolean;
  count: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  updateQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "fixora_cart_v1";

import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from "@/lib/pricing";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
      if (raw) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration of cart from localStorage (external system)
        setItems(JSON.parse(raw) as CartItem[]);
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || typeof window === "undefined") return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, ready]);

  const value = useMemo<CartCtx>(() => {
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : DELIVERY_FEE;
    return {
      items,
      ready,
      count: items.reduce((s, i) => s + i.qty, 0),
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      add(item, qty = 1) {
        setItems((prev) => {
          const existing = prev.find((i) => i.id === item.id);
          if (existing) {
            return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + qty } : i));
          }
          return [...prev, { ...item, qty }];
        });
      },
      updateQty(id, qty) {
        setItems((prev) =>
          qty <= 0 ? prev.filter((i) => i.id !== id) : prev.map((i) => (i.id === id ? { ...i, qty } : i))
        );
      },
      remove(id) {
        setItems((prev) => prev.filter((i) => i.id !== id));
      },
      clear() {
        setItems([]);
      },
    };
  }, [items, ready]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}