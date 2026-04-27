import React, { useState } from "react";

function Investment() {
  const [initial, setInitial] = useState("");
  const [monthlyContribution, setMonthlyContribution] = useState("");
  const [annualReturn, setAnnualReturn] = useState("");
  const [years, setYears] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const res = await fetch("http://localhost:5000/api/investment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        initial: parseFloat(initial) || 0,
        monthly_contribution: parseFloat(monthlyContribution) || 0,
        annual_return: parseFloat(annualReturn) || 0,
        years: parseInt(years),
      }),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="page-card">
      <h1 className="page-title">Investment Returns</h1>
      <p className="page-subtitle">See how your investments grow over time with compound returns.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
        <div className="input-group">
          <label className="input-label">Initial Investment ($)</label>
          <input
            type="number"
            placeholder="e.g. 1000"
            value={initial}
            onChange={(e) => setInitial(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label className="input-label">Monthly Contribution ($)</label>
          <input
            type="number"
            placeholder="e.g. 100"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label className="input-label">Annual Return Rate (%)</label>
          <input
            type="number"
            placeholder="e.g. 10"
            value={annualReturn}
            onChange={(e) => setAnnualReturn(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label className="input-label">Time Period (years)</label>
          <input
            type="number"
            placeholder="e.g. 10"
            value={years}
            onChange={(e) => setYears(e.target.value)}
          />
        </div>
      </div>

      <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
        {loading ? "Calculating..." : "Calculate Returns"}
      </button>

      {loading && <p className="loading">Projecting your wealth...</p>}

      {result && !result.error && (
        <div>
          <div className="result-grid" style={{ marginTop: "24px" }}>
            <div className="result-card highlight">
              <div className="label">Future Value</div>
              <div className="value">${result.future_value.toLocaleString()}</div>
            </div>
            <div className="result-card">
              <div className="label">Total Contributed</div>
              <div className="value">${result.total_contributed.toLocaleString()}</div>
            </div>
            <div className="result-card">
              <div className="label">Total Gains</div>
              <div className="value" style={{ color: "#1a6b2f" }}>${result.total_gains.toLocaleString()}</div>
            </div>
            <div className="result-card">
              <div className="label">ROI</div>
              <div className="value">{result.roi}%</div>
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

      {result && result.error && (
        <p style={{ color: "red", marginTop: "12px" }}>{result.error}</p>
      )}
    </div>
  );
}

export default Investment;