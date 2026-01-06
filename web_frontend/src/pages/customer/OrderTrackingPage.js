import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { apiClient } from "../../api/client";
import { useAuth } from "../../app/state/auth";

const STEPS = [
  { key: "pending_payment", title: "Pending payment", desc: "Waiting for payment." },
  { key: "paid", title: "Paid", desc: "Payment confirmed." },
  { key: "accepted", title: "Restaurant accepted", desc: "The restaurant accepted your order." },
  { key: "preparing", title: "Preparing", desc: "Food is being prepared." },
  { key: "ready_for_pickup", title: "Ready for pickup", desc: "Courier will pick up soon." },
  { key: "picked_up", title: "Picked up", desc: "Courier picked up your order." },
  { key: "delivered", title: "Delivered", desc: "Enjoy your meal!" },
];

// PUBLIC_INTERFACE
export function OrderTrackingPage() {
  /** Live tracking UI: polls events and also listens to websocket when available. */
  const { orderId } = useParams();
  const { token } = useAuth();

  const [events, setEvents] = useState([]);
  const [wsState, setWsState] = useState("disconnected");
  const wsRef = useRef(null);

  // Polling fallback (requires auth)
  useEffect(() => {
    if (!token) return;
    let alive = true;

    const poll = async () => {
      try {
        const res = await apiClient.listTrackingEvents({ token, order_id: orderId });
        if (alive) setEvents(res || []);
      } catch {
        // ignore; UI still shows WS state / last known events
      }
    };

    poll();
    const t = setInterval(poll, 4000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [token, orderId]);

  // WebSocket (does not require auth in this backend implementation)
  useEffect(() => {
    const url = apiClient.wsOrderTrackingUrl(orderId);
    if (!url) return;

    let closed = false;
    setWsState("connecting");
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      if (closed) return;
      setWsState("connected");
    };
    ws.onclose = () => {
      if (closed) return;
      setWsState("disconnected");
    };
    ws.onerror = () => {
      if (closed) return;
      setWsState("error");
    };
    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        if (msg?.type === "tracking_event" && msg?.payload) {
          // Keep a small in-memory log (best-effort); polling remains source-of-truth.
          setEvents((prev) => [
            ...prev,
            {
              id: `ws_${Date.now()}`,
              order_id: orderId,
              event_type: msg.payload.event_type || "tracking_event",
              event_message: msg.payload.event_message || "",
              latitude: msg.payload.latitude ?? null,
              longitude: msg.payload.longitude ?? null,
              created_at: new Date().toISOString(),
            },
          ]);
        }
      } catch {
        // ignore invalid json
      }
    };

    return () => {
      closed = true;
      try {
        ws.close();
      } catch {
        // ignore
      }
    };
  }, [orderId]);

  const current = useMemo(() => {
    // Try to derive status from latest event_type/status_* events.
    const latest = events?.[events.length - 1];
    const ev = (latest?.event_type || "").toLowerCase();
    const statusFromEvent = ev.startsWith("status_") ? ev.replace("status_", "") : "";
    const normalized = statusFromEvent || "";
    const step = STEPS.find((s) => s.key === normalized);
    return step || STEPS[0];
  }, [events]);

  return (
    <div className="grid two">
      <section className="card pad">
        <h1 className="pageTitle">Tracking</h1>
        <p className="pageSub">Order <strong>{orderId}</strong></p>

        <div className="notice">
          <div className="row">
            <span className="pill">Current status</span>
            <strong style={{ color: "var(--primary-700)" }}>{current.key}</strong>
            <div className="spacer" />
            <span className="pill">WS: {wsState}</span>
          </div>
          <div className="smallMuted" style={{ marginTop: 6 }}>
            WebSocket: <code>/tracking/ws/orders/{orderId}</code> • Polling fallback: <code>/tracking/orders/{orderId}/events</code>
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
