import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../api/client";

// PUBLIC_INTERFACE
export function OrderHistoryPage() {
  /** Customer order history list with drill-down to tracking UI. */
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const res = await apiClient.listMyOrders();
      if (alive) setOrders(res);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="card pad">
      <h1 className="pageTitle">Your orders</h1>
      <p className="pageSub">Track current orders and review past deliveries.</p>

      {loading ? (
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
                <p className="itemTitle">{o.restaurantName || "Restaurant"}</p>
                <p className="itemMeta">
                  {new Date(o.createdAt).toLocaleString()} • <strong>{o.status}</strong> • ${Number(o.total).toFixed(2)}
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
