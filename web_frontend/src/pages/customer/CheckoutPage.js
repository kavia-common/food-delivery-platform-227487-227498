import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../api/client";
import { useCart, calcCartTotal } from "../../app/state/cart";

// PUBLIC_INTERFACE
export function CheckoutPage() {
  /** Checkout UI with address + order placement. */
  const navigate = useNavigate();
  const { cart, setCart } = useCart();

  const [address, setAddress] = useState("123 Main St, Springfield");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = useMemo(() => calcCartTotal(cart), [cart]);

  const placeOrder = async () => {
    setError("");
    if (!cart.restaurantId || cart.items.length === 0) {
      setError("Your cart is empty. Add items from a restaurant first.");
      return;
    }
    setLoading(true);
    try {
      const order = await apiClient.createOrder({
        restaurantId: cart.restaurantId,
        items: cart.items,
        address,
      });
      // Clear cart after placing order
      setCart({ restaurantId: null, restaurantName: null, items: [] });
      navigate(`/customer/order-confirmation/${order.id}`, { state: { order } });
    } catch (e) {
      setError(e.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid two">
      <section className="card pad">
        <h1 className="pageTitle">Checkout</h1>
        <p className="pageSub">Confirm your delivery address and payment.</p>

        <div style={{ marginBottom: 12 }}>
          <label className="label">Delivery address</label>
          <textarea className="textarea" rows={3} value={address} onChange={(e) => setAddress(e.target.value)} />
          <div className="help">Payments are UI-only for now; backend payment integration will be added later.</div>
        </div>

        {error && <div className="notice" style={{ borderColor: "rgba(239,68,68,0.5)", background: "rgba(239,68,68,0.06)" }}>{error}</div>}

        <div className="row" style={{ marginTop: 14 }}>
          <button className="btn btnPrimary" type="button" onClick={placeOrder} disabled={loading}>
            {loading ? "Placing…" : `Pay $${total.toFixed(2)} & place order`}
          </button>
          <button className="btn" type="button" onClick={() => navigate("/customer/restaurants")}>
            Continue browsing
          </button>
        </div>
      </section>

      <section className="card pad">
        <div className="row">
          <h2 className="cardTitle">Your cart</h2>
          <div className="spacer" />
          <span className="pill">{cart.restaurantName || "No restaurant selected"}</span>
        </div>

        <div style={{ height: 10 }} />

        {cart.items.length === 0 ? (
          <div className="notice">Your cart is empty.</div>
        ) : (
          <div className="grid">
            {cart.items.map((it) => (
              <div key={it.id} className="listItem">
                <div className="avatar" aria-hidden="true">
                  {it.qty}
                </div>
                <div style={{ flex: 1 }}>
                  <p className="itemTitle">{it.name}</p>
                  <p className="itemMeta">
                    ${it.price.toFixed(2)} • Qty {it.qty}
                  </p>
                </div>
                <span className="pill">${(it.price * it.qty).toFixed(2)}</span>
              </div>
            ))}
            <div className="listItem" style={{ justifyContent: "space-between" }}>
              <strong>Total</strong>
              <strong>${total.toFixed(2)}</strong>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
