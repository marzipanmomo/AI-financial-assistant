import React, { useState, useEffect } from "react";
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
  return <span>{prefix}{displayValue.toFixed(2)}{suffix}</span>;
}

function Loan({ user }) {
  const { symbol } = useCurrency();
  const [principal, setPrincipal] = useState(() => localStorage.getItem("loan_principal") || "");
  const [annualRate, setAnnualRate] = useState(() => localStorage.getItem("loan_rate") || "");
  const [months, setMonths] = useState(() => localStorage.getItem("loan_months") || "");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  useEffect(() => { localStorage.setItem("loan_principal", principal); }, [principal]);
  useEffect(() => { localStorage.setItem("loan_rate", annualRate); }, [annualRate]);
  useEffect(() => { localStorage.setItem("loan_months", months); }, [months]);

  const handleClear = () => {
    setPrincipal(""); setAnnualRate(""); setMonths("");
    setResult(null); setError("");
    localStorage.removeItem("loan_principal");
    localStorage.removeItem("loan_rate");
    localStorage.removeItem("loan_months");
  };

  const handleSubmit = async () => {
    if (!principal || parseFloat(principal) <= 0) {
      setError("Please enter a valid loan amount.");
      showToast('error', 'Please enter a valid loan amount');
      return;
    }
    if (!months || parseInt(months) <= 0) {
      setError("Please enter a valid duration.");
      showToast('error', 'Please enter a valid duration');
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/loan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          principal: parseFloat(principal),
          annual_rate: parseFloat(annualRate) || 0,
          months: parseInt(months),
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setResult(null);
        showToast('error', data.error);
      } else {
        setResult(data);
        showToast('success', 'EMI calculated successfully!');
        if (user) saveHistory(user.id, "loan", {
          principal: parseFloat(principal),
          annual_rate: parseFloat(annualRate) || 0,
          months: parseInt(months)
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
    const element = document.getElementById('loan-results');
    if (!element) { showToast('error', 'No results to export'); return; }
    showToast('info', 'Generating PDF...');
    try {
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#0a0f1a' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save('loan-report.pdf');
      showToast('success', 'PDF exported successfully!');
    } catch (error) {
      console.error('PDF error:', error);
      showToast('error', 'Failed to generate PDF');
    }
  };

  return (
    <div className="page-card">
      <div className="result-header">
        <h1 className="page-title">Loan & EMI Calculator</h1>
        {result && (
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn-secondary" onClick={() => { playClick(); handleClear(); }}>✕ Clear</button>
            <button className="btn-secondary export-btn" onClick={() => { playClick(); exportToPDF(); }}>📄 Export PDF</button>
          </div>
        )}
      </div>
      <p className="page-subtitle">Find out your monthly payment and total interest on any loan.</p>

      <div className="input-row">
        <div className="input-group">
          <label className="input-label">Loan Amount ({symbol})</label>
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

      <button className="btn-primary" onClick={() => { playClick(); handleSubmit(); }} disabled={loading}>
        {loading ? "Calculating..." : "Calculate EMI"}
      </button>

      {error && <p className="error-msg">{error}</p>}

      <div id="loan-results">
        {loading ? (
          <Skeleton count={4} />
        ) : result && (
          <div>
            <div className="result-grid">
              <div className="result-card highlight">
                <div className="label">Monthly EMI</div>
                <div className="value">
                  <AnimatedValue value={result.emi} prefix={symbol} />
                </div>
              </div>
              <div className="result-card">
                <div className="label">Total Payment</div>
                <div className="value">
                  <AnimatedValue value={result.total_payment} prefix={symbol} />
                </div>
              </div>
              <div className="result-card">
                <div className="label">Total Interest</div>
                <div className="value">
                  <AnimatedValue value={result.total_interest} prefix={symbol} />
                </div>
              </div>
              <div className="result-card">
                <div className="label">Duration</div>
                <div className="value">{result.months} months</div>
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
    </div>
  );
}

export default Loan;