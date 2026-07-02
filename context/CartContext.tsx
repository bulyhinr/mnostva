
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, licenseType?: 'standard' | 'commercial') => void;
  removeFromCart: (productId: string, licenseType?: 'standard' | 'commercial') => void;
  updateQuantity: (productId: string, quantity: number, licenseType?: 'standard' | 'commercial') => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const calculateDiscountedPrice = (price: number, discountPercentage: number): number => {
  const priceCents = Math.round(price * 100);
  const discountCents = Math.round(priceCents * (discountPercentage / 100));
  return (priceCents - discountCents) / 100;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('mnostva_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('mnostva_cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  // Synchronize cart across tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'mnostva_cart') {
        if (event.newValue) {
          try {
            setCart(JSON.parse(event.newValue));
          } catch (e) {
            console.error("Failed to parse synchronized cart", e);
          }
        } else {
          setCart([]);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const addToCart = (product: Product, quantity: number = 1, licenseType: 'standard' | 'commercial' = 'standard') => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && (item.licenseType || 'standard') === licenseType);
      if (existing) {
        return prev.map(item =>
          item.id === product.id && (item.licenseType || 'standard') === licenseType
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity, licenseType }];
    });
  };

  const updateQuantity = (productId: string, quantity: number, licenseType: 'standard' | 'commercial' = 'standard') => {
    setCart(prev => prev.map(item =>
      item.id === productId && (item.licenseType || 'standard') === licenseType ? { ...item, quantity: Math.max(1, quantity) } : item
    ));
  };

  const removeFromCart = (productId: string, licenseType: 'standard' | 'commercial' = 'standard') => {
    setCart(prev => prev.filter(item => !(item.id === productId && (item.licenseType || 'standard') === licenseType)));
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => {
    const basePrice = item.licenseType === 'commercial' && item.commercialPrice ? item.commercialPrice : item.price;
    const price = item.discount && item.discount.isActive
      ? calculateDiscountedPrice(basePrice, item.discount.percentage)
      : basePrice;
    return sum + (price * item.quantity);
  }, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
