import React, { useState, useEffect } from "react";

function Loan() {
  const [principal, setPrincipal] = useState(() => localStorage.getItem("loan_principal") || "");
  const [annualRate, setAnnualRate] = useState(() => localStorage.getItem("loan_rate") || "");
  const [months, setMonths] = useState(() => localStorage.getItem("loan_months") || "");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { localStorage.setItem("loan_principal", principal); }, [principal]);
  useEffect(() => { localStorage.setItem("loan_rate", annualRate); }, [annualRate]);
  useEffect(() => { localStorage.setItem("loan_months", months); }, [months]);

  const handleSubmit = async () => {
    if (!principal || parseFloat(principal) <= 0) { setError("Please enter a valid loan amount."); return; }
    if (!months || parseInt(months) <= 0) { setError("Please enter a valid duration."); return; }
    setError("");
    setLoading(true);
    try {
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
      if (data.error) { setError(data.error); setResult(null); }
      else setResult(data);
    } catch {
      setError("Could not connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-card">
      <h1 className="page-title">Loan & EMI Calculator</h1>
      <p className="page-subtitle">Find out your monthly payment and total interest on any loan.</p>

      <div className="input-row">
        <div className="input-group">
          <label className="input-label">Loan Amount ($)</label>
          <input type="number" placeholder="e.g. 10000" value={principal} onChange={(e) => setPrincipal(e.target.value)} />
        </div>
        <div className="input-group">
          <label className="input-label">Annual Interest Rate (%)</label>
          <input type="number" placeholder="e.g. 8.5" value={annualRate} onChange={(e) => setAnnualRate(e.target.value)} />
        </div>
        <div className="input-group">
          <label className="input-label">Duration (months)</label>
          <input type="number" placeholder="e.g. 24" value={months} onChange={(e) => setMonths(e.target.value)} />
        </div>
      </div>

      <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
        {loading ? "Calculating..." : "Calculate EMI"}
      </button>

      {loading && <p className="loading">Crunching the numbers...</p>}
      {error && <p className="error-msg">{error}</p>}

      {result && (
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
    </div>
  );
}

export default Loan;
