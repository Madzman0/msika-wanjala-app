// context/CartContext.js
import React, { createContext, useState } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // ✅ Add item to cart
  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.id === product.id);

      if (existing) {
        // If already in cart, increase quantity
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, qty: (item.qty || 1) + 1 }
            : item
        );
      }
      // Otherwise, add new product with qty = 1
      return [...prevItems, { ...product, qty: 1 }];
    });
  };

  // ✅ Remove item completely
  const removeFromCart = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  // ✅ Update quantity (increase or decrease)
  const updateQuantity = (id, qty) => {
    if (qty <= 0) {
      removeFromCart(id);
    } else {
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? { ...item, qty } : item
        )
      );
    }
  };

  // ✅ Clear all items
  const clearCart = () => {
    setCartItems([]);
  };

  // ✅ Get total price of all items in cart
  const getTotalPrice = () => {
    return cartItems.reduce(
      (acc, item) => acc + (item.price || 0) * (item.qty || 1),
      0
    );
  };

  // ✅ Get total number of items
  const getTotalItems = () => {
    return cartItems.reduce((acc, item) => acc + (item.qty || 1), 0);
  };

  // ✅ Get total price for a single item
  const getItemTotal = (id) => {
    const item = cartItems.find((item) => item.id === id);
    return item ? (item.price || 0) * (item.qty || 1) : 0;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
        getItemTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
