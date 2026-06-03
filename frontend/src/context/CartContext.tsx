import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import type { CartItem, DeliveryAddress, Product, Variant } from 'types';

type CartContextValue = {
  items: CartItem[];
  deliveryAddress: DeliveryAddress | null;
  addItem: (product: Product, variant: Variant, quantity: number) => void;
  removeItem: (productId: number, variantId: number) => void;
  updateQuantity: (productId: number, variantId: number, quantity: number) => void;
  setDeliveryAddress: (address: DeliveryAddress) => void;
  clearDeliveryAddress: () => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem('topix-cart');
    return stored ? (JSON.parse(stored) as CartItem[]) : [];
  });
  const [deliveryAddress, setDeliveryAddressState] = useState<DeliveryAddress | null>(() => {
    const stored = localStorage.getItem('topix-delivery-address');
    return stored ? (JSON.parse(stored) as DeliveryAddress) : null;
  });

  useEffect(() => {
    localStorage.setItem('topix-cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (deliveryAddress) {
      localStorage.setItem('topix-delivery-address', JSON.stringify(deliveryAddress));
      return;
    }

    localStorage.removeItem('topix-delivery-address');
  }, [deliveryAddress]);

  function addItem(product: Product, variant: Variant, quantity: number) {
    setItems((current) => {
      const existing = current.find((item) => item.product.id === product.id && item.variant.id === variant.id);
      if (existing) {
        return current.map((item) =>
          item.product.id === product.id && item.variant.id === variant.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }

      return [...current, { product, variant, quantity }];
    });
  }

  function removeItem(productId: number, variantId: number) {
    setItems((current) => current.filter((item) => !(item.product.id === productId && item.variant.id === variantId)));
  }

  function updateQuantity(productId: number, variantId: number, quantity: number) {
    if (quantity <= 0) {
      removeItem(productId, variantId);
      return;
    }

    setItems((current) =>
      current.map((item) =>
        item.product.id === productId && item.variant.id === variantId ? { ...item, quantity } : item,
      ),
    );
  }

  function setDeliveryAddress(address: DeliveryAddress) {
    setDeliveryAddressState(address);
  }

  function clearDeliveryAddress() {
    setDeliveryAddressState(null);
  }

  function clearCart() {
    setItems([]);
  }

  const value = useMemo(
    () => ({
      items,
      deliveryAddress,
      addItem,
      removeItem,
      updateQuantity,
      setDeliveryAddress,
      clearDeliveryAddress,
      clearCart,
    }),
    [items, deliveryAddress],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
