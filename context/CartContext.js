import React, { createContext, useState } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);


  const addToCart = (place) => {
    setCart((prevCart) => [...prevCart, place]);
  };

  const removeFromCart = (placeID) => {
    setCart((prevCart) => prevCart.filter((item) => item.placeID !== placeID));
  };

  const clearCart = () => {
    setCart([]);
  };

  const setCartData = (cartData) => {
    setCart(cartData);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, setCartData }}>
      {children}
    </CartContext.Provider>
  );
};
