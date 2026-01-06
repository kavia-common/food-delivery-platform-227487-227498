import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

const STEPS = [
  { key: "PLACED", title: "Order placed", desc: "We’ve received your order." },
  { key: "ACCEPTED", title: "Restaurant accepted", desc: "The restaurant is confirming items." },
  { key: "PREPARING", title: "Preparing", desc: "Food is being prepared." },
  { key: "PICKED_UP", title: "Picked up", desc: "Courier picked up your order." },
  { key: "DELIVERED", title: "Delivered", desc: "Enjoy your meal!" },
];

// PUBLIC_INTERFACE
export function OrderTrackingPage() {
  /** Live tracking UI; will connect to backend realtime updates once implemented. */
  const { orderId } = useParams();
  const [statusIndex, setStatusIndex] = useState(1);

  // Simulate progress in absence of realtime backend.
  useEffect(() => {
    const t = setInterval(() => {
      setStatusIndex((i) => (i < STEPS.length - 1 ? i + 1 : i));
    }, 4500);
    return () => clearInterval(t);
  }, []);

  const current = useMemo(() => STEPS[statusIndex], [statusIndex]);

  return (
    <div className="grid two">
      <section className="card pad">
        <h1 className="pageTitle">Tracking</h1>
        <p className="pageSub">Order <strong>{orderId}</strong></p>

        <div className="notice">
          <div className="row">
            <span className="pill">Current status</span>
            <strong style={{ color: "var(--primary-700)" }}>{current.key}</strong>
          </div>
          <div className="smallMuted" style={{ marginTop: 6 }}>
            Realtime updates will be wired to FastAPI/WebSocket once available.
          </div>
        </div>

        <div className="card" style={{ marginTop: 12 }}>
          <div className="cardHeader">
            <div>
              <p className="cardTitle">Status timeline</p>
              <p className="cardSub">UI progresses automatically for now.</p>
            </div>
          </div>
          <div className="card pad">
            <div className="timeline">
              {STEPS.map((s, idx) => (
                <div className="step" key={s.key}>
                  <div className={`dot ${idx <= statusIndex ? "active" : ""}`} />
                  <div className="stepBody">
                    <p className="stepTitle">{s.title}</p>
                    <p className="stepDesc">{s.desc}</p>
                  </div>
                  {idx === statusIndex && <span className="pill">Now</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="card pad">
        <h2 className="cardTitle">Map preview</h2>
        <p className="cardSub">This is a placeholder map panel for MVP.</p>
        <div
          className="card"
          style={{
            marginTop: 12,
            height: 320,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, rgba(59,130,246,0.10), rgba(6,182,212,0.08), rgba(255,255,255,1))",
          }}
        >
          <div className="notice" style={{ maxWidth: 420 }}>
            Map integration (Google Maps/Mapbox) can be added later. The tracking UI is ready to consume backend coordinates/status events.
          </div>
        </div>
      </section>
    </div>
  );
}
