import React, { useState, useEffect } from "react";

function BillSplitter() {
  const [total, setTotal] = useState(() => localStorage.getItem("split_total") || "");
  const [people, setPeople] = useState(() => localStorage.getItem("split_people") || "");
  const [tipPercent, setTipPercent] = useState(() => localStorage.getItem("split_tip") || "0");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { localStorage.setItem("split_total", total); }, [total]);
  useEffect(() => { localStorage.setItem("split_people", people); }, [people]);
  useEffect(() => { localStorage.setItem("split_tip", tipPercent); }, [tipPercent]);

  const handleSubmit = async () => {
    if (!total || parseFloat(total) <= 0) { setError("Please enter a valid bill total."); return; }
    if (!people || parseInt(people) < 2) { setError("Please enter at least 2 people."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/split", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          total: parseFloat(total),
          people: parseInt(people),
          tip_percent: parseFloat(tipPercent) || 0,
        }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setResult(null); }
      else setResult(data);
    } catch {
      setError("Could not connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const TIP_PRESETS = ["0", "10", "15", "18", "20", "25"];

  return (
    <div className="page-card">
      <h1 className="page-title">Bill Splitter</h1>
      <p className="page-subtitle">Split any bill fairly between friends, with tip included.</p>

      <div className="input-row">
        <div className="input-group">
          <label className="input-label">Bill Total ($)</label>
          <input type="number" placeholder="e.g. 120" value={total} onChange={(e) => setTotal(e.target.value)} />
        </div>
        <div className="input-group">
          <label className="input-label">Number of People</label>
          <input type="number" placeholder="e.g. 4" value={people} onChange={(e) => setPeople(e.target.value)} />
        </div>
        <div className="input-group">
          <label className="input-label">Tip (%)</label>
          <input type="number" placeholder="e.g. 15" value={tipPercent} onChange={(e) => setTipPercent(e.target.value)} />
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {TIP_PRESETS.map((t) => (
          <button
            key={t}
            onClick={() => setTipPercent(t)}
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              border: "1.5px solid",
              borderColor: tipPercent === t ? "var(--accent)" : "var(--border-accent)",
              background: tipPercent === t ? "var(--accent)" : "transparent",
              color: tipPercent === t ? "#000" : "var(--accent)",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {t}%
          </button>
        ))}
      </div>

      <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
        {loading ? "Splitting..." : "Split Bill"}
      </button>

      {loading && <p className="loading">Calculating...</p>}
      {error && <p className="error-msg">{error}</p>}

      {result && (
        <div>
          <div className="result-grid" style={{ marginTop: "24px" }}>
            <div className="result-card">
              <div className="label">Bill Total</div>
              <div className="value">${result.original_total}</div>
            </div>
            <div className="result-card">
              <div className="label">Tip ({result.tip_percent}%)</div>
              <div className="value">${result.tip_amount}</div>
            </div>
            <div className="result-card">
              <div className="label">Grand Total</div>
              <div className="value">${result.grand_total}</div>
            </div>
            <div className="result-card highlight">
              <div className="label">Each Person Pays</div>
              <div className="value">${result.per_person}</div>
            </div>
          </div>

          <div className="ai-insight" style={{ marginTop: "20px" }}>
            <div className="ai-label">✦ Summary</div>
            <p>
              Split between <strong>{result.people} people</strong> — each pays <strong>${result.per_person}</strong> including a {result.tip_percent}% tip.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default BillSplitter;
