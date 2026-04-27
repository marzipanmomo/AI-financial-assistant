import React, { useState } from "react";

function Loan() {
  const [principal, setPrincipal] = useState("");
  const [annualRate, setAnnualRate] = useState("");
  const [months, setMonths] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const res = await fetch("http://localhost:5000/api/loan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        principal: parseFloat(principal),
        annual_rate: parseFloat(annualRate) || 0,
        months: parseInt(months),
      }),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="page-card">
      <h1 className="page-title">Loan & EMI Calculator</h1>
      <p className="page-subtitle">Find out your monthly payment and total interest on any loan.</p>

      <div className="input-row">
        <div className="input-group">
          <label className="input-label">Loan Amount ($)</label>
          <input
            type="number"
            placeholder="e.g. 10000"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label className="input-label">Annual Interest Rate (%)</label>
          <input
            type="number"
            placeholder="e.g. 8.5"
            value={annualRate}
            onChange={(e) => setAnnualRate(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label className="input-label">Duration (months)</label>
          <input
            type="number"
            placeholder="e.g. 24"
            value={months}
            onChange={(e) => setMonths(e.target.value)}
          />
        </div>
      </div>

      <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
        {loading ? "Calculating..." : "Calculate EMI"}
      </button>

      {loading && <p className="loading">Crunching the numbers...</p>}

      {result && !result.error && (
        <div>
          <div className="result-grid">
            <div className="result-card highlight">
              <div className="label">Monthly EMI</div>
              <div className="value">${result.emi}</div>
            </div>
            <div className="result-card">
              <div className="label">Total Payment</div>
              <div className="value">${result.total_payment}</div>
            </div>
            <div className="result-card">
              <div className="label">Total Interest</div>
              <div className="value">${result.total_interest}</div>
            </div>
            <div className="result-card">
              <div className="label">Duration</div>
              <div className="value">{result.months}mo</div>
            </div>
          </div>

          {result.ai_tip && (
            <div className="ai-insight">
              <div className="ai-label">✦ AI Tip</div>
              <p>{result.ai_tip}</p>
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

export default Loan;