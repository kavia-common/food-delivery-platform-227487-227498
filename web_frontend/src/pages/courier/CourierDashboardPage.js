import React, { useEffect, useState } from "react";
import { apiClient } from "../../api/client";

const STATUS_FLOW = ["ASSIGNED", "PICKED_UP", "DELIVERED"];

// PUBLIC_INTERFACE
export function CourierDashboardPage() {
  /** Courier dashboard: view assigned deliveries and push status updates. */
  const [deliveries, setDeliveries] = useState([]);
  const [savingId, setSavingId] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      const res = await apiClient.courierAssignedDeliveries();
      if (alive) setDeliveries(res);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const advance = async (d) => {
    const idx = STATUS_FLOW.indexOf(d.status);
    const next = idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : d.status;

    setSavingId(d.id);
    try {
      await apiClient.courierUpdateDeliveryStatus({ orderId: d.id, status: next });
      setDeliveries((prev) => prev.map((x) => (x.id === d.id ? { ...x, status: next } : x)));
    } finally {
      setSavingId("");
    }
  };

  return (
    <div className="grid two">
      <section className="card pad">
        <h1 className="pageTitle">Courier dashboard</h1>
        <p className="pageSub">See assigned deliveries and update status in real-time once backend is wired.</p>

        <div className="notice">
          Status updates are UI-only until the FastAPI courier endpoints are implemented.
        </div>

        <div className="card" style={{ marginTop: 12 }}>
          <div className="cardHeader">
            <div>
              <p className="cardTitle">How it works</p>
              <p className="cardSub">ASSIGNED → PICKED_UP → DELIVERED</p>
            </div>
          </div>
          <div className="card pad">
            <div className="timeline">
              {STATUS_FLOW.map((s, i) => (
                <div className="step" key={s}>
                  <div className="dot active" />
                  <div className="stepBody">
                    <p className="stepTitle">{i + 1}. {s}</p>
                    <p className="stepDesc">Set status to {s} when appropriate.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="card pad">
        <div className="row">
          <h2 className="cardTitle">Assigned deliveries</h2>
          <div className="spacer" />
          <span className="pill">{deliveries.length} active</span>
        </div>

        <div style={{ height: 10 }} />

        {deliveries.length === 0 ? (
          <div className="notice">No deliveries assigned.</div>
        ) : (
          <div className="grid">
            {deliveries.map((d) => (
              <div className="listItem" key={d.id}>
                <div className="avatar" aria-hidden="true">
                  🚚
                </div>
                <div style={{ flex: 1 }}>
                  <p className="itemTitle">Order {d.id}</p>
                  <p className="itemMeta">
                    Pickup: {d.pickup} • Dropoff: {d.dropoff}
                  </p>
                  <div className="row" style={{ marginTop: 8 }}>
                    <span className="pill">Status: {d.status}</span>
                  </div>
                </div>
                <button className="btn btnPrimary" type="button" onClick={() => advance(d)} disabled={savingId === d.id || d.status === "DELIVERED"}>
                  {d.status === "DELIVERED" ? "Done" : savingId === d.id ? "Updating…" : "Advance"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
