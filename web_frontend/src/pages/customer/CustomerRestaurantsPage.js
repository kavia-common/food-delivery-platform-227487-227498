import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../api/client";

// PUBLIC_INTERFACE
export function CustomerRestaurantsPage() {
  /** Customer landing page: restaurant list with simple search/filter panel. */
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [q, setQ] = useState("");
  const [maxEta, setMaxEta] = useState(60);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const res = await apiClient.listRestaurants();
      if (alive) setRestaurants(res);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return restaurants
      .filter((r) => (query ? r.name.toLowerCase().includes(query) || (r.city || "").toLowerCase().includes(query) : true))
      .filter((r) => {
        // Backend doesn't provide ETA yet; keep slider but treat as always passing.
        const etaMin = r.etaMin ?? 25;
        return etaMin <= maxEta;
      });
  }, [restaurants, q, maxEta]);

  return (
    <div className="grid two">
      <section className="card pad">
        <h1 className="pageTitle">Restaurants</h1>
        <p className="pageSub">Browse nearby restaurants and add items to your cart.</p>

        <div className="grid" style={{ gap: 12 }}>
          <div>
            <label className="label">Search</label>
            <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try “pizza” or “bowl”" />
          </div>

          <div>
            <label className="label">Max ETA (minutes): {maxEta}</label>
            <input
              className="input"
              type="range"
              min="10"
              max="60"
              value={maxEta}
              onChange={(e) => setMaxEta(Number(e.target.value))}
            />
            <div className="help">Use the slider to filter faster delivery options.</div>
          </div>
        </div>
      </section>

      <section className="card pad">
        <div className="row">
          <h2 className="cardTitle">Results</h2>
          <div className="spacer" />
          <span className="pill">{filtered.length} found</span>
        </div>

        <div style={{ height: 10 }} />

        {loading ? (
          <div className="notice">Loading restaurants…</div>
        ) : filtered.length === 0 ? (
          <div className="notice">No restaurants match your filters.</div>
        ) : (
          <div className="grid">
            {filtered.map((r) => (
              <div key={r.id} className="listItem" role="button" tabIndex={0} onClick={() => navigate(`/customer/restaurants/${r.id}`)}>
                <div className="avatar" aria-hidden="true">
                  {r.name?.slice(0, 1)?.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p className="itemTitle">{r.name}</p>
                  <p className="itemMeta">
                    {(r.city || "City")} {r.state ? `• ${r.state}` : ""} • <strong>{r.etaMin ?? 25} min</strong>
                  </p>
                </div>
                <button className="btn btnPrimary" type="button" onClick={() => navigate(`/customer/restaurants/${r.id}`)}>
                  View
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
