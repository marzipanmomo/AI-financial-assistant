import React, { useState, useEffect } from "react";

function Expenses() {
  const [items, setItems] = useState(() => localStorage.getItem("expenses_items") || "");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { localStorage.setItem("expenses_items", items); }, [items]);

  const handleSubmit = async () => {
    if (!items.trim()) { setError("Please enter some purchases."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purchases: items }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setResult(""); }
      else setResult(data.ai_analysis);
    } catch {
      setError("Could not connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-card">
      <h1 className="page-title">Expense Analyzer</h1>
      <p className="page-subtitle">Enter your purchases and get AI-powered spending insights.</p>

      <div className="input-group">
        <label className="input-label">Your Purchases</label>
        <input
          type="text"
          placeholder="e.g. Netflix, Uber, Coffee, Groceries"
          value={items}
          onChange={(e) => setItems(e.target.value)}
        />
      </div>

      <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
        {loading ? "Analyzing..." : "Analyze Expenses"}
      </button>

      {loading && <p className="loading">AI is analyzing your spending patterns...</p>}
      {error && <p className="error-msg">{error}</p>}

      {result && (
        <div className="ai-insight" style={{ marginTop: "24px" }}>
          <div className="ai-label">✦ AI Analysis</div>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
}

export default Expenses;
