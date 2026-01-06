import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

// PUBLIC_INTERFACE
export function OrderConfirmationPage() {
  /** Order confirmation screen after checkout. */
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const order = location.state?.order;

  return (
    <div className="card pad" style={{ maxWidth: 720, margin: "0 auto" }}>
      <h1 className="pageTitle">Order confirmed</h1>
      <p className="pageSub">Your order has been placed and is being processed.</p>

      <div className="notice">
        <div className="row">
          <span className="pill">Order ID</span>
          <strong>{orderId}</strong>
        </div>
        {order?.createdAt && <div className="smallMuted" style={{ marginTop: 6 }}>Placed at {new Date(order.createdAt).toLocaleString()}</div>}
      </div>

      <div className="row" style={{ marginTop: 14 }}>
        <button className="btn btnPrimary" type="button" onClick={() => navigate(`/customer/track/${orderId}`)}>
          Track order
        </button>
        <button className="btn" type="button" onClick={() => navigate("/customer/orders")}>
          View order history
        </button>
        <button className="btn" type="button" onClick={() => navigate("/customer/restaurants")}>
          Order more
        </button>
      </div>
    </div>
  );
}
