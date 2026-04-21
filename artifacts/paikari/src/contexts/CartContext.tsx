import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "@workspace/api-client-react";

export interface CartItem {
  productId: string;
  qty: number;
  product?: Product; // Stored temporarily or enriched later
}

interface CartContextType {
  items: CartItem[];
  addItem: (productId: string, qty: number, product?: Product) => void;
  updateQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem("p69_cart");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("p69_cart", JSON.stringify(items));
  }, [items]);

  const addItem = (productId: string, qty: number, product?: Product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === productId
            ? { ...item, qty: item.qty + qty, product: product || item.product }
            : item
        );
      }
      return [...prev, { productId, qty, product }];
    });
  };

  const updateQty = (productId: string, qty: number) => {
    setItems((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, qty } : item))
    );
  };

  const remove = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clear = () => setItems([]);

  const itemCount = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider value={{ items, addItem, updateQty, remove, clear, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
