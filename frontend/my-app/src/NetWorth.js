import React, { useState } from "react";

function NetWorth() {
  const [assets, setAssets] = useState([{ name: "", amount: "" }]);
  const [liabilities, setLiabilities] = useState([{ name: "", amount: "" }]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const addRow = (list, setList) => setList([...list, { name: "", amount: "" }]);
  const removeRow = (list, setList, index) => setList(list.filter((_, i) => i !== index));
  const updateRow = (list, setList, index, field, value) => {
    const updated = [...list];
    updated[index][field] = value;
    setList(updated);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const validAssets = assets.filter((a) => a.name && a.amount);
    const validLiabilities = liabilities.filter((l) => l.name && l.amount);
    const res = await fetch("http://localhost:5000/api/networth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assets: validAssets, liabilities: validLiabilities }),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  const renderRows = (list, setList, placeholder) => list.map((item, index) => (
    <div key={index} className="expense-row">
      <input type="text" placeholder={placeholder} value={item.name} onChange={(e) => updateRow(list, setList, index, "name", e.target.value)} />
      <input type="number" placeholder="Amount ($)" value={item.amount} onChange={(e) => updateRow(list, setList, index, "amount", e.target.value)} />
      <button className="btn-danger" onClick={() => removeRow(list, setList, index)}>Remove</button>
    </div>
  ));

  const netWorthColor = result && result.net_worth >= 0 ? "#1a6b2f" : "#c0392b";

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

      {result && (
        <div>
          <div className="result-grid">
            <div className="result-card">
              <div className="label">Total Assets</div>
              <div className="value">${result.total_assets.toLocaleString()}</div>
            </div>
            <div className="result-card">
              <div className="label">Total Liabilities</div>
              <div className="value" style={{ color: "#c0392b" }}>${result.total_liabilities.toLocaleString()}</div>
            </div>
            <div className="result-card" style={{ background: result.net_worth >= 0 ? "#f0f7f0" : "#fff5f5", borderColor: result.net_worth >= 0 ? "#d0e8d0" : "#f5c6c6" }}>
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