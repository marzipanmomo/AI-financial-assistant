import React, { useState } from "react";

function BillSplitter() {
  const [total, setTotal] = useState("");
  const [people, setPeople] = useState("");
  const [tipPercent, setTipPercent] = useState("0");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
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
    setResult(data);
    setLoading(false);
  };

  const TIP_PRESETS = ["0", "10", "15", "18", "20", "25"];

  return (
    <div className="page-card">
      <h1 className="page-title">Bill Splitter</h1>
      <p className="page-subtitle">Split any bill fairly between friends, with tip included.</p>

      <div className="input-row">
        <div className="input-group">
          <label className="input-label">Bill Total ($)</label>
          <input
            type="number"
            placeholder="e.g. 120"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label className="input-label">Number of People</label>
          <input
            type="number"
            placeholder="e.g. 4"
            value={people}
            onChange={(e) => setPeople(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label className="input-label">Tip (%)</label>
          <input
            type="number"
            placeholder="e.g. 15"
            value={tipPercent}
            onChange={(e) => setTipPercent(e.target.value)}
          />
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
              borderColor: tipPercent === t ? "#1a6b2f" : "#d0e8d0",
              background: tipPercent === t ? "#1a6b2f" : "white",
              color: tipPercent === t ? "white" : "#1a6b2f",
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

      {result && !result.error && (
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

          <div className="ai-insight" style={{ background: "#f0f7f0", borderLeft: "4px solid #27ae60" }}>
            <div className="ai-label">✦ Summary</div>
            <p>
              Split between <strong>{result.people} people</strong> — each person pays <strong>${result.per_person}</strong> including a {result.tip_percent}% tip.
            </p>
          </div>
        </div>
      )}

      {result && result.error && (
        <p style={{ color: "red", marginTop: "12px" }}>{result.error}</p>
      )}
    </div>
  );
}

export default BillSplitter;