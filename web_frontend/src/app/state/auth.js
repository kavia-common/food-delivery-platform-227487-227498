import React, { useContext } from "react";

export const AuthContext = React.createContext(null);

// PUBLIC_INTERFACE
export function useAuth() {
  /** Hook to access auth state and helpers. */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AppProviders");
  return ctx;
}
