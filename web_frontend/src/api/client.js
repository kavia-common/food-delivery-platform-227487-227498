/**
 * Centralized API client for the Food Delivery Platform frontend.
 *
 * Backend base URL:
 * - Configure with REACT_APP_API_BASE_URL (e.g., http://localhost:3001)
 * - Defaults to same-origin (empty string) so it works behind a proxy/rewrite.
 */

const DEFAULT_TIMEOUT_MS = 15000;

function getApiBaseUrl() {
  return process.env.REACT_APP_API_BASE_URL || "";
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
        (payload && payload.detail) ||
          (typeof payload === "string" ? payload : "Request failed")
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
    /** Health-check call aligned with current backend OpenAPI spec. */
    return request("/", { method: "GET" });
  },

  // Auth (placeholder until backend auth endpoints exist)
  // PUBLIC_INTERFACE
  async login({ email, password }) {
    /** Attempt backend login; fallback to mock token/role if endpoint missing. */
    try {
      return await request("/auth/login", { method: "POST", body: { email, password } });
    } catch (e) {
      // Mock behavior: infer role by email prefix.
      const role =
        email?.toLowerCase().includes("rest") ? "restaurant" : email?.toLowerCase().includes("cour") ? "courier" : "customer";
      return { token: "mock-token", user: { id: "mock-user", email, role } };
    }
  },

  // PUBLIC_INTERFACE
  async register({ email, password, role }) {
    /** Attempt backend register; fallback to mock user. */
    try {
      return await request("/auth/register", {
        method: "POST",
        body: { email, password, role },
      });
    } catch (e) {
      return { token: "mock-token", user: { id: "mock-user", email, role } };
    }
  },

  // Customer-facing data (mock until backend provides endpoints)
  // PUBLIC_INTERFACE
  async listRestaurants() {
    /** Returns restaurants list from backend or mock data if not implemented yet. */
    try {
      return await request("/restaurants", { method: "GET" });
    } catch (e) {
      return [
        { id: "r1", name: "Blue Bowl Kitchen", cuisine: "Bowls • Healthy", etaMin: 25 },
        { id: "r2", name: "Slice & Spice", cuisine: "Pizza • Indian Fusion", etaMin: 35 },
        { id: "r3", name: "Tide & Lime", cuisine: "Seafood • Tacos", etaMin: 30 },
      ];
    }
  },

  // PUBLIC_INTERFACE
  async getRestaurantDetails(restaurantId) {
    /** Returns restaurant details + menu. */
    try {
      return await request(`/restaurants/${restaurantId}`, { method: "GET" });
    } catch (e) {
      const menus = {
        r1: [
          { id: "m1", name: "Salmon Poke Bowl", price: 13.99, description: "Rice, salmon, cucumber, sesame, lime." },
          { id: "m2", name: "Tofu Power Bowl", price: 11.5, description: "Quinoa, tofu, kale, tahini drizzle." },
        ],
        r2: [
          { id: "m3", name: "Masala Pepperoni Pizza", price: 15.25, description: "Pepperoni + masala spices + chili honey." },
          { id: "m4", name: "Paneer Tikka Slice", price: 14.75, description: "Paneer tikka, onions, bell pepper." },
        ],
        r3: [
          { id: "m5", name: "Baja Fish Taco", price: 4.5, description: "Crispy fish, slaw, lime crema." },
          { id: "m6", name: "Shrimp Citrus Taco", price: 5.0, description: "Shrimp, grapefruit salsa, cilantro." },
        ],
      };
      const base = (await this.listRestaurants()).find((r) => r.id === restaurantId);
      return { ...base, description: "Fresh, fast, and packed with flavor.", menu: menus[restaurantId] || [] };
    }
  },

  // PUBLIC_INTERFACE
  async createOrder({ restaurantId, items, address }) {
    /** Create an order; fallback returns mock order id/status for tracking UI. */
    try {
      return await request("/orders", { method: "POST", body: { restaurantId, items, address } });
    } catch (e) {
      return {
        id: `o_${Math.random().toString(16).slice(2)}`,
        restaurantId,
        items,
        address,
        status: "PLACED",
        createdAt: new Date().toISOString(),
      };
    }
  },

  // PUBLIC_INTERFACE
  async listMyOrders() {
    /** List current user's order history (mock fallback). */
    try {
      return await request("/orders/me", { method: "GET" });
    } catch (e) {
      return [
        { id: "o_1001", restaurantName: "Blue Bowl Kitchen", total: 25.49, status: "DELIVERED", createdAt: "2026-01-01T12:10:00Z" },
        { id: "o_1002", restaurantName: "Slice & Spice", total: 18.75, status: "IN_PROGRESS", createdAt: "2026-01-05T18:40:00Z" },
      ];
    }
  },

  // Restaurant dashboard (mock)
  // PUBLIC_INTERFACE
  async restaurantIncomingOrders() {
    /** Orders for restaurant to accept/prepare. */
    try {
      return await request("/restaurant/orders", { method: "GET" });
    } catch (e) {
      return [
        { id: "o_2001", customer: "Alex", items: 3, status: "PLACED", etaMin: 28 },
        { id: "o_2002", customer: "Jamie", items: 1, status: "PREPARING", etaMin: 18 },
      ];
    }
  },

  // PUBLIC_INTERFACE
  async restaurantUpdateMenuItem({ restaurantId, item }) {
    /** Update/create menu item. */
    try {
      return await request(`/restaurants/${restaurantId}/menu`, { method: "POST", body: { item } });
    } catch (e) {
      return { ok: true };
    }
  },

  // Courier dashboard (mock)
  // PUBLIC_INTERFACE
  async courierAssignedDeliveries() {
    /** Assigned deliveries for courier. */
    try {
      return await request("/courier/deliveries", { method: "GET" });
    } catch (e) {
      return [
        { id: "o_3001", pickup: "Blue Bowl Kitchen", dropoff: "22 Market St", status: "ASSIGNED" },
        { id: "o_3002", pickup: "Tide & Lime", dropoff: "9 Pine Ave", status: "PICKED_UP" },
      ];
    }
  },

  // PUBLIC_INTERFACE
  async courierUpdateDeliveryStatus({ orderId, status }) {
    /** Update courier delivery status (ASSIGNED -> PICKED_UP -> DELIVERED). */
    try {
      return await request(`/courier/deliveries/${orderId}`, { method: "PATCH", body: { status } });
    } catch (e) {
      return { ok: true };
    }
  },
};
