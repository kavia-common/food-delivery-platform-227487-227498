import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../state/auth";

import { LoginPage } from "../../pages/auth/LoginPage";
import { RegisterPage } from "../../pages/auth/RegisterPage";

import { CustomerRestaurantsPage } from "../../pages/customer/CustomerRestaurantsPage";
import { RestaurantDetailsPage } from "../../pages/customer/RestaurantDetailsPage";
import { CheckoutPage } from "../../pages/customer/CheckoutPage";
import { OrderConfirmationPage } from "../../pages/customer/OrderConfirmationPage";
import { OrderHistoryPage } from "../../pages/customer/OrderHistoryPage";
import { OrderTrackingPage } from "../../pages/customer/OrderTrackingPage";

import { RestaurantDashboardPage } from "../../pages/restaurant/RestaurantDashboardPage";
import { CourierDashboardPage } from "../../pages/courier/CourierDashboardPage";

function RequireAuth({ children }) {
  const { auth } = useAuth();
  if (!auth.user) return <Navigate to="/login" replace />;
  return children;
}

function RequireRole({ role, children }) {
  const { auth } = useAuth();
  if (!auth.user) return <Navigate to="/login" replace />;
  if (auth.user.role !== role) return <Navigate to="/" replace />;
  return children;
}

// PUBLIC_INTERFACE
export function AppRoutes() {
  /** Application routes for role-aware flows. */
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Customer */}
      <Route
        path="/customer/restaurants"
        element={
          <RequireAuth>
            <CustomerRestaurantsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/customer/restaurants/:restaurantId"
        element={
          <RequireAuth>
            <RestaurantDetailsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/customer/checkout"
        element={
          <RequireAuth>
            <CheckoutPage />
          </RequireAuth>
        }
      />
      <Route
        path="/customer/order-confirmation/:orderId"
        element={
          <RequireAuth>
            <OrderConfirmationPage />
          </RequireAuth>
        }
      />
      <Route
        path="/customer/orders"
        element={
          <RequireAuth>
            <OrderHistoryPage />
          </RequireAuth>
        }
      />
      <Route
        path="/customer/track/:orderId"
        element={
          <RequireAuth>
            <OrderTrackingPage />
          </RequireAuth>
        }
      />

      {/* Restaurant */}
      <Route
        path="/restaurant/dashboard"
        element={
          <RequireRole role="restaurant">
            <RestaurantDashboardPage />
          </RequireRole>
        }
      />

      {/* Courier */}
      <Route
        path="/courier/dashboard"
        element={
          <RequireRole role="courier">
            <CourierDashboardPage />
          </RequireRole>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function HomeRedirect() {
  const { auth } = useAuth();
  if (!auth.user) return <Navigate to="/login" replace />;
  if (auth.user.role === "restaurant") return <Navigate to="/restaurant/dashboard" replace />;
  if (auth.user.role === "courier") return <Navigate to="/courier/dashboard" replace />;
  return <Navigate to="/customer/restaurants" replace />;
}

function NotFound() {
  return (
    <div className="card pad">
      <h1 className="pageTitle">Page not found</h1>
      <p className="pageSub">The page you requested doesn’t exist.</p>
    </div>
  );
}
