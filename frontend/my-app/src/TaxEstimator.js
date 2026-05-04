import React, { useState } from "react";
import Skeleton from "./Skeleton";
import { playClick } from "./sound.js";
import { saveHistory } from "./saveHistory";
import { useCurrency } from "./CurrencyContext";
import ModelSentimentBadge from "./ModelSentimentBadge";

function TaxEstimator({ user }) {
  const { symbol } = useCurrency();
  const [income, setIncome] = useState("");
  const [taxpayerType, setTaxpayerType] = useState("salaried");
  const [deductions, setDeductions] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClear = () => {
    setIncome(""); setTaxpayerType("salaried"); setDeductions("");
    setResult(null); setError("");
  };

  const handleSubmit = async () => {
    if (!income || parseFloat(income) <= 0) {
      setError("Please enter a valid annual income.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const body = {
        income: parseFloat(income),
        taxpayer_type: taxpayerType,
        extra_deductions: parseFloat(deductions) || 0,
      };
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/tax`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setResult(null);
      } else {
        setResult(data);
        if (user) saveHistory(user.id, "tax", body, data);
      }
    } catch {
      setError("Could not connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const taxpayerLabels = {
    salaried: "Salaried Individual",
    business: "Business Individual / AOP",
  };

  return (
    <div className="page-card">
      <div className="result-header">
        <h1 className="page-title">Tax Estimator</h1>
      </div>
      <p className="page-subtitle">
        Estimate your Pakistan income tax for FY 2025–26 (Tax Year 2026) under FBR slabs.
      </p>

      <div className="input-row">
        <div className="input-group">
          <label className="input-label">Annual Income (PKR)</label>
          <input
            type="number"
            placeholder="e.g. 1200000"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label className="input-label">Taxpayer Type</label>
          <select value={taxpayerType} onChange={(e) => setTaxpayerType(e.target.value)}>
            <option value="salaried">Salaried Individual</option>
            <option value="business">Business Individual / AOP</option>
          </select>
        </div>
        <div className="input-group">
          <label className="input-label">
            Extra Deductions (PKR){" "}
            <span style={{ color: "#4a5568", fontWeight: "400" }}>optional</span>
          </label>
          <input
            type="number"
            placeholder="e.g. Zakat, provident fund..."
            value={deductions}
            onChange={(e) => setDeductions(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        <button
          className="btn-primary"
          onClick={() => { playClick(); handleSubmit(); }}
          disabled={loading}
        >
          {loading ? "Calculating..." : "Estimate Tax"}
        </button>
        <button className="btn-secondary" onClick={() => { playClick(); handleClear(); }}>
          ✕ Clear
        </button>
      </div>
      
      {error && <p className="error-msg">{error}</p>}

      {loading ? (
        <Skeleton count={5} />
      ) : result && (
        <div>
          <div className="result-grid" style={{ marginTop: "24px" }}>
            <div className="result-card highlight">
              <div className="label">Estimated Income Tax</div>
              <div className="value" style={{ color: "#ff4d6d" }}>
                PKR {result.estimated_tax.toLocaleString()}
              </div>
            </div>
            <div className="result-card">
              <div className="label">Taxable Income</div>
              <div className="value">PKR {result.taxable_income.toLocaleString()}</div>
            </div>
            <div className="result-card">
              <div className="label">Effective Rate</div>
              <div className="value">{result.effective_rate}%</div>
            </div>
            <div className="result-card">
              <div className="label">Marginal Rate</div>
              <div className="value">{result.marginal_rate}%</div>
            </div>
            <div className="result-card">
              <div className="label">Monthly Take-Home</div>
              <div className="value" style={{ color: "#00ff88" }}>
                PKR {result.monthly_take_home.toLocaleString()}
              </div>
            </div>
          </div>

          {result.surcharge > 0 && (
            <div className="result-grid" style={{ marginTop: "12px" }}>
              <div className="result-card">
                <div className="label">Super Tax / Surcharge</div>
                <div className="value" style={{ color: "#ff4d6d" }}>
                  PKR {result.surcharge.toLocaleString()}
                </div>
              </div>
              <div className="result-card">
                <div className="label">Total Tax (incl. surcharge)</div>
                <div className="value" style={{ color: "#ff4d6d" }}>
                  PKR {result.total_tax.toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {result.total_deductions > 0 && (
            <>
              <div className="section-label" style={{ marginTop: "20px" }}>Deductions</div>
              <ul className="breakdown-list">
                {result.zakat_deduction > 0 && (
                  <li>
                    <span className="item-name">Zakat / Charitable Deduction</span>
                    <span className="item-amount">PKR {result.zakat_deduction.toLocaleString()}</span>
                  </li>
                )}
                {result.extra_deductions > 0 && (
                  <li>
                    <span className="item-name">Other Deductions (Provident Fund etc.)</span>
                    <span className="item-amount">PKR {result.extra_deductions.toLocaleString()}</span>
                  </li>
                )}
              </ul>
            </>
          )}

          <div className="section-label" style={{ marginTop: "20px" }}>
            FBR Tax Bracket Breakdown — {taxpayerLabels[result.taxpayer_type]}
          </div>
          <ul className="breakdown-list">
            {result.brackets.map((b, i) => (
              <li key={i}>
                <span className="item-name">{b.rate}% bracket</span>
                <span className="item-amount">PKR {b.tax.toLocaleString()}</span>
              </li>
            ))}
          </ul>

          <div style={{ marginTop: "12px", color: "#4a5568", fontSize: "12px" }}>
            * Based on FBR Finance Act 2025 slabs (Tax Year 2026). Does not include provincial taxes, WHT, or AJK/FATA exemptions.
            Filer status assumed — non-filer rates are higher.
          </div>

          {result.ai_tip && (
            <>
              <div className="ai-insight">
                <div className="ai-label">✦ Tax Tip (Groq)</div>
                <p>{result.ai_tip}</p>
              </div>
              <ModelSentimentBadge sentiment={result.model_sentiment} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default TaxEstimator;
