import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../app/state/auth";
import { useCart, calcCartTotal } from "../../app/state/cart";

// PUBLIC_INTERFACE
export function CustomerBottomBar() {
  /** Customer-only fixed bottom cart/payment bar (hidden for other roles and auth screens). */
  const { auth } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const role = auth.user?.role;
  const total = calcCartTotal(cart);

  const isAuthRoute = location.pathname.startsWith("/login") || location.pathname.startsWith("/register");
  const isCustomer = role === "customer";

  if (!auth.user || isAuthRoute || !isCustomer) return null;

  return (
    <div className="bottomBar" role="region" aria-label="Cart and payment bar">
      <div className="container bottomBarInner">
        <div className="bottomBarSummary">
          <div className="kpi">
            {cart.items.length} item{cart.items.length === 1 ? "" : "s"} • ${total.toFixed(2)}
          </div>
          <div className="smallMuted">
            {cart.restaurantName ? `From ${cart.restaurantName}` : "Add items from a restaurant to start checkout"}
          </div>
        </div>

        <div className="row" style={{ gap: 10 }}>
          <button
            className="btn"
            type="button"
            onClick={() => navigate("/customer/orders")}
            aria-label="View order history"
          >
            Orders
          </button>
          <button
            className="btn btnPrimary"
            type="button"
            onClick={() => navigate("/customer/checkout")}
            disabled={cart.items.length === 0}
            aria-label="Proceed to checkout"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
