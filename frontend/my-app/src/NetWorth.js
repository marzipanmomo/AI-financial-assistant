import React, { useState, useEffect } from "react";

function NetWorth() {
  const [assets, setAssets] = useState(() => {
    try { return JSON.parse(localStorage.getItem("nw_assets")) || [{ name: "", amount: "" }]; }
    catch { return [{ name: "", amount: "" }]; }
  });
  const [liabilities, setLiabilities] = useState(() => {
    try { return JSON.parse(localStorage.getItem("nw_liabilities")) || [{ name: "", amount: "" }]; }
    catch { return [{ name: "", amount: "" }]; }
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { localStorage.setItem("nw_assets", JSON.stringify(assets)); }, [assets]);
  useEffect(() => { localStorage.setItem("nw_liabilities", JSON.stringify(liabilities)); }, [liabilities]);

  const addRow = (list, setList) => setList([...list, { name: "", amount: "" }]);
  const removeRow = (list, setList, index) => setList(list.filter((_, i) => i !== index));
  const updateRow = (list, setList, index, field, value) => {
    const updated = [...list];
    updated[index][field] = value;
    setList(updated);
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const validAssets = assets.filter((a) => a.name && a.amount);
      const validLiabilities = liabilities.filter((l) => l.name && l.amount);
      const res = await fetch("http://localhost:5000/api/networth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assets: validAssets, liabilities: validLiabilities }),
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

  const renderRows = (list, setList, placeholder) =>
    list.map((item, index) => (
      <div key={index} className="expense-row">
        <input type="text" placeholder={placeholder} value={item.name} onChange={(e) => updateRow(list, setList, index, "name", e.target.value)} />
        <input type="number" placeholder="Amount ($)" value={item.amount} onChange={(e) => updateRow(list, setList, index, "amount", e.target.value)} />
        <button className="btn-danger" onClick={() => removeRow(list, setList, index)}>Remove</button>
      </div>
    ));

  const netWorthColor = result && result.net_worth >= 0 ? "#00ff88" : "#ff4d6d";

  return (
    <div className="page-card">
      <h1 className="page-title">Net Worth Tracker</h1>
      <p className="page-subtitle">Add your assets and liabilities to calculate your true financial picture.</p>

      <div className="section-label">Assets (what you own)</div>
      {renderRows(assets, setAssets, "e.g. Savings, Car, Property")}
      <button className="btn-secondary" onClick={() => addRow(assets, setAssets)} style={{ marginBottom: "20px" }}>+ Add Asset</button>

      <div className="section-label">Liabilities (what you owe)</div>
      {renderRows(liabilities, setLiabilities, "e.g. Loan, Credit Card, Mortgage")}
      <button className="btn-secondary" onClick={() => addRow(liabilities, setLiabilities)} style={{ marginBottom: "20px" }}>+ Add Liability</button>

      <br />
      <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
        {loading ? "Calculating..." : "Calculate Net Worth"}
      </button>

      {loading && <p className="loading">Analyzing your finances...</p>}
      {error && <p className="error-msg">{error}</p>}

      {result && (
        <div>
          <div className="result-grid">
            <div className="result-card">
              <div className="label">Total Assets</div>
              <div className="value">${result.total_assets.toLocaleString()}</div>
            </div>
            <div className="result-card">
              <div className="label">Total Liabilities</div>
              <div className="value" style={{ color: "#ff4d6d" }}>${result.total_liabilities.toLocaleString()}</div>
            </div>
            <div className="result-card" style={{ background: result.net_worth >= 0 ? "rgba(0,255,136,0.08)" : "rgba(255,77,109,0.08)", borderColor: result.net_worth >= 0 ? "rgba(0,255,136,0.3)" : "rgba(255,77,109,0.3)" }}>
              <div className="label" style={{ color: netWorthColor }}>Net Worth</div>
              <div className="value" style={{ color: netWorthColor }}>${result.net_worth.toLocaleString()}</div>
            </div>
          </div>

          {result.ai_insight && (
            <div className="ai-insight">
              <div className="ai-label">✦ AI Insight</div>
              <p>{result.ai_insight}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NetWorth;
