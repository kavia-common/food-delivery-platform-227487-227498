import React, { useMemo, useState } from "react";
import { AuthContext } from "../state/auth";
import { CartContext } from "../state/cart";

// PUBLIC_INTERFACE
export function AppProviders({ children }) {
  /** Provides app-wide state (auth/role + cart) using lightweight React contexts. */
  const [auth, setAuth] = useState({
    token: null,
    user: null, // { id, email, role }
  });

  const [cart, setCart] = useState({
    restaurantId: null,
    restaurantName: null,
    items: [], // { id, name, price, qty }
  });

  const authValue = useMemo(() => ({ auth, setAuth }), [auth]);
  const cartValue = useMemo(() => ({ cart, setCart }), [cart]);

  return (
    <AuthContext.Provider value={authValue}>
      <CartContext.Provider value={cartValue}>{children}</CartContext.Provider>
    </AuthContext.Provider>
  );
}
