import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "../../api/client";
import { useAuth } from "../../app/state/auth";

// PUBLIC_INTERFACE
export function RegisterPage() {
  /** Registration UI (backend-integrated when /auth/register exists; otherwise mock). */
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState("customer");
  const [email, setEmail] = useState("newuser@example.com");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiClient.register({ email, password, role });
      setAuth({ token: res.token, user: res.user });
      navigate("/");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card pad" style={{ maxWidth: 520, margin: "0 auto" }}>
      <h1 className="pageTitle">Create an account</h1>
      <p className="pageSub">Choose your role — you can switch later in the top bar.</p>

      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label className="label">Role</label>
          <select className="select" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="customer">Customer</option>
            <option value="restaurant">Restaurant</option>
            <option value="courier">Courier</option>
          </select>
        </div>

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
            autoComplete="new-password"
          />
        </div>

        {error && <div className="notice" style={{ borderColor: "rgba(239,68,68,0.5)", background: "rgba(239,68,68,0.06)" }}>{error}</div>}

        <div className="row" style={{ marginTop: 14 }}>
          <button className="btn btnPrimary" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </button>
          <div className="help">
            Already have an account? <Link to="/login" style={{ color: "var(--primary)" }}>Sign in</Link>
          </div>
        </div>
      </form>
    </div>
  );
}
