import React, { useContext } from "react";

export const CartContext = React.createContext(null);

// PUBLIC_INTERFACE
export function useCart() {
  /** Hook to access cart state and helpers. */
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within AppProviders");
  return ctx;
}

// PUBLIC_INTERFACE
export function calcCartTotal(cart) {
  /** Calculate cart total from items. */
  return (cart?.items || []).reduce((sum, it) => sum + it.price * it.qty, 0);
}
