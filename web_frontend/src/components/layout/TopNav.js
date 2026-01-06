import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../app/state/auth";
import { useCart, calcCartTotal } from "../../app/state/cart";

// PUBLIC_INTERFACE
export function TopNav() {
  /** Sticky top navigation including role switcher and role-aware links. */
  const { auth, setAuth } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const role = auth.user?.role;

  const onLogout = () => {
    setAuth({ token: null, user: null });
    navigate("/login");
  };

  const switchRole = (nextRole) => {
    if (!auth.user) return;
    setAuth((prev) => ({
      ...prev,
      user: { ...prev.user, role: nextRole },
    }));

    if (nextRole === "restaurant") navigate("/restaurant/dashboard");
    else if (nextRole === "courier") navigate("/courier/dashboard");
    else navigate("/customer/restaurants");
  };

  return (
    <header className="topNav">
      <div className="container topNavInner">
        <div className="brand" onClick={() => navigate("/")} role="button" tabIndex={0}>
          <div className="brandMark" aria-hidden="true" />
          <span>FoodDash</span>
        </div>

        <div className="navLinks">
          {role === "customer" && (
            <>
              <NavLink to="/customer/restaurants" className={({ isActive }) => `navLink ${isActive ? "active" : ""}`}>
                Restaurants
              </NavLink>
              <NavLink to="/customer/orders" className={({ isActive }) => `navLink ${isActive ? "active" : ""}`}>
                Orders
              </NavLink>
            </>
          )}

          {role === "restaurant" && (
            <NavLink to="/restaurant/dashboard" className={({ isActive }) => `navLink ${isActive ? "active" : ""}`}>
              Dashboard
            </NavLink>
          )}

          {role === "courier" && (
            <NavLink to="/courier/dashboard" className={({ isActive }) => `navLink ${isActive ? "active" : ""}`}>
              Deliveries
            </NavLink>
          )}
        </div>

        <div className="spacer" />

        {auth.user && (
          <div className="pill" title="Signed in">
            <span style={{ fontWeight: 900 }}>{auth.user.email}</span>
            <span style={{ opacity: 0.8 }}>•</span>
            <span>{auth.user.role}</span>
            {role === "customer" && (
              <>
                <span style={{ opacity: 0.8 }}>•</span>
                <span>${calcCartTotal(cart).toFixed(2)}</span>
              </>
            )}
          </div>
        )}

        {/* Role switcher (requested in style guide layout) */}
        <div className="roleSwitch" aria-label="Role switch">
          <button
            className={`roleBtn ${role === "customer" ? "active" : ""}`}
            onClick={() => switchRole("customer")}
            disabled={!auth.user}
            type="button"
          >
            Customer
          </button>
          <button
            className={`roleBtn ${role === "restaurant" ? "active" : ""}`}
            onClick={() => switchRole("restaurant")}
            disabled={!auth.user}
            type="button"
          >
            Restaurant
          </button>
          <button
            className={`roleBtn ${role === "courier" ? "active" : ""}`}
            onClick={() => switchRole("courier")}
            disabled={!auth.user}
            type="button"
          >
            Courier
          </button>
        </div>

        {auth.user ? (
          <button className="btn" onClick={onLogout} type="button">
            Log out
          </button>
        ) : (
          <button className="btn btnPrimary" onClick={() => navigate("/login")} type="button">
            Sign in
          </button>
        )}
      </div>
    </header>
  );
}
