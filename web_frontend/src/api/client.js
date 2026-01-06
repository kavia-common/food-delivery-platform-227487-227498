/**
 * Centralized API client for the Food Delivery Platform frontend.
 *
 * Backend base URL:
 * - Configure with REACT_APP_API_BASE_URL (e.g., http://localhost:3001)
 * - Defaults to same-origin (empty string) so it works behind a proxy/rewrite.
 *
 * WebSocket base:
 * - Configure with REACT_APP_WS_BASE_URL (e.g., ws://localhost:3001)
 * - If omitted, derived from REACT_APP_API_BASE_URL by switching scheme http->ws, https->wss.
 */

const DEFAULT_TIMEOUT_MS = 15000;

function getApiBaseUrl() {
  return process.env.REACT_APP_API_BASE_URL || "";
}

function getWsBaseUrl() {
  const explicit = process.env.REACT_APP_WS_BASE_URL;
  if (explicit) return explicit;

  const apiBase = getApiBaseUrl();
  if (!apiBase) return "";

  if (apiBase.startsWith("https://")) return apiBase.replace("https://", "wss://");
  if (apiBase.startsWith("http://")) return apiBase.replace("http://", "ws://");
  return apiBase;
}

function buildUrl(path) {
  const base = getApiBaseUrl();
  if (!path.startsWith("/")) return `${base}/${path}`;
  return `${base}${path}`;
}

async function request(path, { method = "GET", token, body, signal } = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const headers = {
      Accept: "application/json",
    };

    if (token) headers.Authorization = `Bearer ${token}`;
    if (body !== undefined) headers["Content-Type"] = "application/json";

    const res = await fetch(buildUrl(path), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: signal || controller.signal,
    });

    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const payload = isJson ? await res.json().catch(() => null) : await res.text();

    if (!res.ok) {
      const error = new Error(
        (payload && payload.detail) || (typeof payload === "string" ? payload : "Request failed")
      );
      error.status = res.status;
      error.payload = payload;
      throw error;
    }

    return payload;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const apiClient = {
  // PUBLIC_INTERFACE
  async health() {
    /** Health-check call aligned with backend; /health is also available. */
    return request("/", { method: "GET" });
  },

  // PUBLIC_INTERFACE
  wsOrderTrackingUrl(orderId) {
    /** Build the WebSocket URL for real-time order tracking. */
    const base = getWsBaseUrl();
    if (!base) return `/tracking/ws/orders/${orderId}`;
    return `${base}/tracking/ws/orders/${orderId}`;
  },

  // PUBLIC_INTERFACE
  async login({ email, password }) {
    /** Backend login; returns {access_token, token_type}. */
    return request("/auth/login", { method: "POST", body: { email, password } });
  },

  // PUBLIC_INTERFACE
  async register({ email, password, full_name, role = "customer", phone = null }) {
    /** Backend registration; returns user profile. */
    return request("/auth/register", {
      method: "POST",
      body: { email, password, full_name, role, phone },
    });
  },

  // PUBLIC_INTERFACE
  async me({ token }) {
    /** Fetch current user profile. */
    return request("/auth/me", { method: "GET", token });
  },

  // PUBLIC_INTERFACE
  async listRestaurants({ city } = {}) {
    /** Public restaurants list. */
    const q = city ? `?city=${encodeURIComponent(city)}` : "";
    return request(`/restaurants${q}`, { method: "GET" });
  },

  // PUBLIC_INTERFACE
  async getRestaurant(restaurantId) {
    /** Public restaurant detail. */
    return request(`/restaurants/${restaurantId}`, { method: "GET" });
  },

  // PUBLIC_INTERFACE
  async listMenusForRestaurant(restaurantId) {
    /** Public menus for a restaurant. */
    return request(`/menus/restaurant/${restaurantId}`, { method: "GET" });
  },

  // PUBLIC_INTERFACE
  async getMenuWithItems(menuId) {
    /** Public menu and its items. */
    return request(`/menus/${menuId}/items`, { method: "GET" });
  },

  // PUBLIC_INTERFACE
  async createOrder({
    token,
    restaurant_id,
    items,
    delivery_address_line1,
    delivery_city,
    delivery_address_line2 = null,
    delivery_state = null,
    delivery_postal_code = null,
    notes = null,
  }) {
    /** Customer creates order (pending_payment). */
    return request("/orders", {
      method: "POST",
      token,
      body: {
        restaurant_id,
        items,
        delivery_address_line1,
        delivery_address_line2,
        delivery_city,
        delivery_state,
        delivery_postal_code,
        notes,
      },
    });
  },

  // PUBLIC_INTERFACE
  async listMyCurrentOrders({ token }) {
    /** Customer current (active) orders. */
    return request("/orders/my/current", { method: "GET", token });
  },

  // PUBLIC_INTERFACE
  async listMyOrderHistory({ token }) {
    /** Customer completed/cancelled orders. */
    return request("/orders/my/history", { method: "GET", token });
  },

  // PUBLIC_INTERFACE
  async createPaymentIntent({ token, order_id }) {
    /** Create mock payment intent (processing). */
    return request("/payments/intent", { method: "POST", token, body: { order_id } });
  },

  // PUBLIC_INTERFACE
  async adminUpdatePaymentStatus({ token, payment_id, status }) {
    /** Admin marks payment status (e.g., succeeded). */
    return request(`/payments/${payment_id}/status`, { method: "POST", token, body: { status } });
  },

  // PUBLIC_INTERFACE
  async listTrackingEvents({ token, order_id }) {
    /** Poll tracking events for order. */
    return request(`/tracking/orders/${order_id}/events`, { method: "GET", token });
  },
};
