import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "../../api/client";
import { useAuth } from "../../app/state/auth";

// PUBLIC_INTERFACE
export function LoginPage() {
  /** Login UI (backend-integrated when /auth/login exists; otherwise mock). */
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("customer@example.com");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiClient.login({ email, password });
      setAuth({ token: res.token, user: res.user });
      navigate("/");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid two">
      <div className="card pad">
        <h1 className="pageTitle">Welcome back</h1>
        <p className="pageSub">Sign in to order food, manage a restaurant, or deliver.</p>

        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label className="label">Email</label>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && <div className="notice" style={{ borderColor: "rgba(239,68,68,0.5)", background: "rgba(239,68,68,0.06)" }}>{error}</div>}

          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn btnPrimary" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
            <div className="help">
              New here? <Link to="/register" style={{ color: "var(--primary)" }}>Create an account</Link>
            </div>
          </div>
        </form>

        <div style={{ marginTop: 16 }} className="help">
          Tip: in mock mode, include <code>rest</code> in email for restaurant role or <code>cour</code> for courier.
        </div>
      </div>

      <div className="card pad">
        <h2 className="cardTitle">What you can do</h2>
        <p className="cardSub">Role-specific flows included in this frontend.</p>

        <div className="timeline" style={{ marginTop: 12 }}>
          <div className="step">
            <div className="dot active" />
            <div className="stepBody">
              <p className="stepTitle">Customer</p>
              <p className="stepDesc">Browse restaurants & menus, checkout, order history, and live tracking UI.</p>
            </div>
          </div>
          <div className="step">
            <div className="dot active" />
            <div className="stepBody">
              <p className="stepTitle">Restaurant</p>
              <p className="stepDesc">Manage menu items and see incoming orders in the dashboard.</p>
            </div>
          </div>
          <div className="step">
            <div className="dot active" />
            <div className="stepBody">
              <p className="stepTitle">Courier</p>
              <p className="stepDesc">View assigned deliveries and push status updates.</p>
            </div>
          </div>
        </div>

        <div className="notice" style={{ marginTop: 14 }}>
          Backend endpoints are currently minimal (health check only). The UI uses mock fallbacks until FastAPI routes are implemented.
        </div>
      </div>
    </div>
  );
}
