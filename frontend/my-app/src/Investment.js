import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import { useCountUp } from './useCountUp';
import Skeleton from './Skeleton';
import { useToast } from './Toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { playClick } from "./sound.js";
import { saveHistory } from "./saveHistory";
import { useCurrency } from "./CurrencyContext";

// ✅ prefix passed as prop
function AnimatedValue({ value, prefix = "", suffix = "" }) {
  const displayValue = useCountUp(value, 600);
  return <span>{prefix}{displayValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}{suffix}</span>;
}

function AnimatedPercent({ value, suffix = "%" }) {
  const displayValue = useCountUp(value, 600);
  return <span>{displayValue.toFixed(1)}{suffix}</span>;
}

function Investment({ user }) {
  const { symbol } = useCurrency();
  const [initial, setInitial] = useState(() => localStorage.getItem("inv_initial") || "");
  const [monthlyContribution, setMonthlyContribution] = useState(() => localStorage.getItem("inv_monthly") || "");
  const [annualReturn, setAnnualReturn] = useState(() => localStorage.getItem("inv_return") || "");
  const [years, setYears] = useState(() => localStorage.getItem("inv_years") || "");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  useEffect(() => { localStorage.setItem("inv_initial", initial); }, [initial]);
  useEffect(() => { localStorage.setItem("inv_monthly", monthlyContribution); }, [monthlyContribution]);
  useEffect(() => { localStorage.setItem("inv_return", annualReturn); }, [annualReturn]);
  useEffect(() => { localStorage.setItem("inv_years", years); }, [years]);

  const handleClear = () => {
    setInitial(""); setMonthlyContribution(""); setAnnualReturn(""); setYears("");
    setResult(null); setError("");
    localStorage.removeItem("inv_initial");
    localStorage.removeItem("inv_monthly");
    localStorage.removeItem("inv_return");
    localStorage.removeItem("inv_years");
  };

  const handleSubmit = async () => {
    if (!years || parseInt(years) <= 0) {
      setError("Please enter a valid time period.");
      showToast('error', 'Please enter a valid time period');
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/investment`, {
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
      if (data.error) {
        setError(data.error);
        setResult(null);
        showToast('error', data.error);
      } else {
        setResult(data);
        showToast('success', 'Investment projection calculated!');
        if (user) saveHistory(user.id, "investment", {
          initial: parseFloat(initial) || 0,
          monthly_contribution: parseFloat(monthlyContribution) || 0,
          annual_return: parseFloat(annualReturn) || 0,
          years: parseInt(years)
        }, data);
      }
    } catch {
      setError("Could not connect to the server. Please try again.");
      showToast('error', 'Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    const element = document.getElementById('investment-results');
    if (!element) { showToast('error', 'No results to export'); return; }
    showToast('info', 'Generating PDF...');
    try {
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#0a0f1a' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save('investment-report.pdf');
      showToast('success', 'PDF exported successfully!');
    } catch (error) {
      console.error('PDF error:', error);
      showToast('error', 'Failed to generate PDF');
    }
  };

  const barData = result ? [
    { name: "Without Returns", Contributed: result.total_contributed, Gains: 0 },
    { name: "With Returns", Contributed: result.total_contributed, Gains: result.total_gains },
  ] : [];

  return (
    <div className="page-card">
      <div className="result-header">
        <h1 className="page-title">Investment Returns</h1>
          {result && (
            <button className="btn-primary export-btn" onClick={() => { playClick(); exportToPDF(); }}>📄 Export PDF</button>
          )}
      </div>
      <p className="page-subtitle">See how your investments grow over time with compound returns.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
        <div className="input-group">
          <label className="input-label">Initial Investment ({symbol})</label>
          <input type="number" placeholder="e.g. 1000" value={initial} onChange={(e) => setInitial(e.target.value)} />
        </div>
        <div className="input-group">
          <label className="input-label">Monthly Contribution ({symbol})</label>
          <input type="number" placeholder="e.g. 100" value={monthlyContribution} onChange={(e) => setMonthlyContribution(e.target.value)} />
        </div>
        <div className="input-group">
          <label className="input-label">Annual Return Rate (%)</label>
          <input type="number" placeholder="e.g. 10" value={annualReturn} onChange={(e) => setAnnualReturn(e.target.value)} />
        </div>
        <div className="input-group">
          <label className="input-label">Time Period (years)</label>
          <input type="number" placeholder="e.g. 10" value={years} onChange={(e) => setYears(e.target.value)} />
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        <button className="btn-primary" onClick={() => { playClick(); handleSubmit(); }} disabled={loading}>
          {loading ? "Calculating..." : "Calculate Returns"}
        </button>
        <button className="btn-secondary" onClick={() => { playClick(); handleClear(); }}>
          ✕ Clear
        </button>
      </div>
      {error && <p className="error-msg">{error}</p>}

      <div id="investment-results">
        {loading ? (
          <Skeleton count={4} />
        ) : result && (
          <div>
            <div className="result-grid" style={{ marginTop: "24px" }}>
              <div className="result-card highlight">
                <div className="label">Future Value</div>
                <div className="value">
                  <AnimatedValue value={result.future_value} prefix={symbol} />
                </div>
              </div>
              <div className="result-card">
                <div className="label">Total Contributed</div>
                <div className="value">
                  <AnimatedValue value={result.total_contributed} prefix={symbol} />
                </div>
              </div>
              <div className="result-card">
                <div className="label">Total Gains</div>
                <div className="value" style={{ color: "#00ff88" }}>
                  <AnimatedValue value={result.total_gains} prefix={symbol} />
                </div>
              </div>
              <div className="result-card">
                <div className="label">ROI</div>
                <div className="value">
                  <AnimatedPercent value={result.roi} />
                </div>
              </div>
            </div>

            <div className="section-label">Growth Breakdown</div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} barCategoryGap="40%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "#8892a4", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#8892a4", fontSize: 11 }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `${symbol}${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => `${symbol}${Number(v).toLocaleString()}`}
                    contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", color: "#f0f4ff", fontSize: "13px" }} />
                  <Legend wrapperStyle={{ color: "#8892a4", fontSize: "12px" }} />
                  <Bar dataKey="Contributed" stackId="a" fill="#0d6efd" radius={[0, 0, 6, 6]} />
                  <Bar dataKey="Gains" stackId="a" fill="#00ff88" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
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
    </div>
  );
}

export default Investment;