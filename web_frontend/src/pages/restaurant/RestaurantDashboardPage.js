import React, { useEffect, useState } from "react";
import { apiClient } from "../../api/client";

// PUBLIC_INTERFACE
export function RestaurantDashboardPage() {
  /** Restaurant dashboard: manage menu items and view incoming orders. */
  const [restaurantId, setRestaurantId] = useState("r1");
  const [incoming, setIncoming] = useState([]);
  const [menuItem, setMenuItem] = useState({ name: "", price: "", description: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const res = await apiClient.restaurantIncomingOrders();
      if (alive) setIncoming(res);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const saveMenuItem = async () => {
    setSaving(true);
    try {
      await apiClient.restaurantUpdateMenuItem({
        restaurantId,
        item: { ...menuItem, price: Number(menuItem.price || 0) },
      });
      setMenuItem({ name: "", price: "", description: "" });
      // No real backend list refresh yet; show a simple confirmation via optimistic UI.
      setIncoming((prev) => prev);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid two">
      <section className="card pad">
        <h1 className="pageTitle">Restaurant dashboard</h1>
        <p className="pageSub">Manage menu items and monitor incoming orders.</p>

        <div className="notice">
          Backend endpoints for restaurant operations will be connected once implemented. Current UI uses mock data.
        </div>

        <div style={{ marginTop: 12 }}>
          <label className="label">Restaurant ID</label>
          <input className="input" value={restaurantId} onChange={(e) => setRestaurantId(e.target.value)} />
        </div>

        <div className="card" style={{ marginTop: 14 }}>
          <div className="cardHeader">
            <div>
              <p className="cardTitle">Add / update menu item</p>
              <p className="cardSub">Create a new menu item for your restaurant.</p>
            </div>
          </div>
          <div className="card pad">
            <div className="grid" style={{ gap: 12 }}>
              <div>
                <label className="label">Item name</label>
                <input className="input" value={menuItem.name} onChange={(e) => setMenuItem((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="row" style={{ alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <label className="label">Price</label>
                  <input
                    className="input"
                    value={menuItem.price}
                    onChange={(e) => setMenuItem((p) => ({ ...p, price: e.target.value }))}
                    placeholder="e.g. 12.99"
                  />
                </div>
                <div style={{ flex: 2 }}>
                  <label className="label">Description</label>
                  <input
                    className="input"
                    value={menuItem.description}
                    onChange={(e) => setMenuItem((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Short description"
                  />
                </div>
              </div>

              <button className="btn btnPrimary" type="button" onClick={saveMenuItem} disabled={saving || !menuItem.name}>
                {saving ? "Saving…" : "Save menu item"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="card pad">
        <div className="row">
          <h2 className="cardTitle">Incoming orders</h2>
          <div className="spacer" />
          <span className="pill">{incoming.length} open</span>
        </div>

        <div style={{ height: 10 }} />

        {incoming.length === 0 ? (
          <div className="notice">No incoming orders right now.</div>
        ) : (
          <div className="grid">
            {incoming.map((o) => (
              <div key={o.id} className="listItem">
                <div className="avatar" aria-hidden="true">
                  {o.items}
                </div>
                <div style={{ flex: 1 }}>
                  <p className="itemTitle">Order {o.id}</p>
                  <p className="itemMeta">
                    Customer: {o.customer} • <strong>{o.status}</strong> • ETA {o.etaMin} min
                  </p>
                </div>
                <button className="btn btnAccent" type="button">
                  Accept
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
