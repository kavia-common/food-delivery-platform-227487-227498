import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../../api/client";
import { useCart, calcCartTotal } from "../../app/state/cart";

// PUBLIC_INTERFACE
export function RestaurantDetailsPage() {
  /** Restaurant detail page: menu browsing and adding items to cart. */
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const { cart, setCart } = useCart();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const restaurant = await apiClient.getRestaurant(restaurantId);
        const menus = await apiClient.listMenusForRestaurant(restaurantId);
        const firstMenuId = menus?.[0]?.id || null;

        const menuWithItems = firstMenuId ? await apiClient.getMenuWithItems(firstMenuId) : { menu: null, items: [] };

        // Normalize to UI shape expected by this page.
        const normalized = {
          ...restaurant,
          etaMin: 25,
          menuId: firstMenuId,
          menu: (menuWithItems.items || []).map((i) => ({
            id: i.id,
            name: i.name,
            description: i.description,
            price: Number(i.price_cents) / 100,
            currency: i.currency,
          })),
        };

        if (alive) setData(normalized);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [restaurantId]);

  const total = useMemo(() => calcCartTotal(cart), [cart]);

  const addToCart = (item) => {
    setNotice("");
    // Lock cart to one restaurant to simplify UX for MVP.
    if (cart.restaurantId && cart.restaurantId !== restaurantId) {
      setNotice("Your cart contains items from a different restaurant. Clear cart to add from this restaurant.");
      return;
    }

    setCart((prev) => {
      const existing = prev.items.find((it) => it.id === item.id);
      const nextItems = existing
        ? prev.items.map((it) => (it.id === item.id ? { ...it, qty: it.qty + 1 } : it))
        : [...prev.items, { id: item.id, name: item.name, price: item.price, qty: 1 }];

      return {
        restaurantId,
        restaurantName: data?.name || prev.restaurantName,
        items: nextItems,
      };
    });
  };

  const clearCart = () => {
    setCart({ restaurantId: null, restaurantName: null, items: [] });
    setNotice("");
  };

  return (
    <div className="grid two">
      <section className="card pad">
        {loading ? (
          <div className="notice">Loading restaurant…</div>
        ) : (
          <>
            <h1 className="pageTitle">{data?.name}</h1>
            <p className="pageSub">
              {(data?.city || "City")} {data?.state ? `• ${data.state}` : ""} • <strong>{data?.etaMin ?? 25} min</strong>
            </p>

            {data?.description && <div className="notice">{data.description}</div>}

            {notice && (
              <div
                className="notice"
                style={{ borderColor: "rgba(245,158,11,0.55)", background: "rgba(245,158,11,0.06)", marginTop: 12 }}
              >
                {notice}
                <div style={{ marginTop: 10 }}>
                  <button className="btn btnDanger" type="button" onClick={clearCart}>
                    Clear cart
                  </button>
                </div>
              </div>
            )}

            <div style={{ marginTop: 14 }}>
              <button className="btn" type="button" onClick={() => navigate("/customer/restaurants")}>
                ← Back to restaurants
              </button>
            </div>
          </>
        )}
      </section>

      <section className="card pad">
        <div className="row">
          <h2 className="cardTitle">Menu</h2>
          <div className="spacer" />
          <span className="pill">${total.toFixed(2)} cart</span>
        </div>

        <div style={{ height: 10 }} />

        {loading ? (
          <div className="notice">Loading menu…</div>
        ) : (data?.menu || []).length === 0 ? (
          <div className="notice">No menu items found.</div>
        ) : (
          <div className="grid">
            {data.menu.map((it) => (
              <div className="listItem" key={it.id}>
                <div className="avatar" aria-hidden="true">
                  $
                </div>
                <div style={{ flex: 1 }}>
                  <p className="itemTitle">{it.name}</p>
                  <p className="itemMeta">{it.description}</p>
                  <div className="row" style={{ marginTop: 8 }}>
                    <span className="pill">${it.price.toFixed(2)}</span>
                  </div>
                </div>
                <button className="btn btnPrimary" type="button" onClick={() => addToCart(it)}>
                  Add
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
