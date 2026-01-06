import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../api/client";
import { useAuth } from "../../app/state/auth";

// PUBLIC_INTERFACE
export function OrderHistoryPage() {
  /** Customer order history list with drill-down to tracking UI. */
  const navigate = useNavigate();
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!token) {
        if (alive) setOrders([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [current, history] = await Promise.all([
          apiClient.listMyCurrentOrders({ token }),
          apiClient.listMyOrderHistory({ token }),
        ]);
        if (alive) setOrders([...(current || []), ...(history || [])]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [token]);

  return (
    <div className="card pad">
      <h1 className="pageTitle">Your orders</h1>
      <p className="pageSub">Track current orders and review past deliveries.</p>

      {!token ? (
        <div className="notice">Please sign in to view your orders.</div>
      ) : loading ? (
        <div className="notice">Loading orders…</div>
      ) : orders.length === 0 ? (
        <div className="notice">No orders yet.</div>
      ) : (
        <div className="grid">
          {orders.map((o) => (
            <div key={o.id} className="listItem">
              <div className="avatar" aria-hidden="true">
                O
              </div>
              <div style={{ flex: 1 }}>
                <p className="itemTitle">Order {o.id}</p>
                <p className="itemMeta">
                  {new Date(o.created_at).toLocaleString()} • <strong>{o.status}</strong> • $
                  {(Number(o.total_cents) / 100).toFixed(2)}
                </p>
              </div>
              <button className="btn btnPrimary" type="button" onClick={() => navigate(`/customer/track/${o.id}`)}>
                Track
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
