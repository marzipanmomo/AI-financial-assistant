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
  return <span>{prefix}{displayValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{suffix}</span>;
}

function NetWorth({ user }) {
  const { symbol } = useCurrency();
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
  const { showToast } = useToast();

  useEffect(() => { localStorage.setItem("nw_assets", JSON.stringify(assets)); }, [assets]);
  useEffect(() => { localStorage.setItem("nw_liabilities", JSON.stringify(liabilities)); }, [liabilities]);

  const handleClear = () => {
    setAssets([{ name: "", amount: "" }]);
    setLiabilities([{ name: "", amount: "" }]);
    setResult(null); setError("");
    localStorage.removeItem("nw_assets");
    localStorage.removeItem("nw_liabilities");
  };

  const addRow = (list, setList) => setList([...list, { name: "", amount: "" }]);
  const removeRow = (list, setList, index) => setList(list.filter((_, i) => i !== index));
  const updateRow = (list, setList, index, field, value) => {
    const updated = [...list];
    updated[index][field] = value;
    setList(updated);
  };

  const handleSubmit = async () => {
    const validAssets = assets.filter((a) => a.name && a.amount);
    const validLiabilities = liabilities.filter((l) => l.name && l.amount);
    if (validAssets.length === 0 && validLiabilities.length === 0) {
      setError("Please add at least one asset or liability.");
      showToast('error', 'Please add at least one asset or liability');
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/networth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assets: validAssets, liabilities: validLiabilities }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setResult(null);
        showToast('error', data.error);
      } else {
        setResult(data);
        showToast('success', 'Net worth calculated successfully!');
        if (user) saveHistory(user.id, "networth", { assets: validAssets, liabilities: validLiabilities }, data);
      }
    } catch {
      setError("Could not connect to the server. Please try again.");
      showToast('error', 'Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    const element = document.getElementById('networth-results');
    if (!element) { showToast('error', 'No results to export'); return; }
    showToast('info', 'Generating PDF...');
    try {
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#0a0f1a' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save('networth-report.pdf');
      showToast('success', 'PDF exported successfully!');
    } catch (error) {
      console.error('PDF error:', error);
      showToast('error', 'Failed to generate PDF');
    }
  };

  const renderRows = (list, setList, placeholder) =>
    list.map((item, index) => (
      <div key={index} className="expense-row">
        <input type="text" placeholder={placeholder} value={item.name} onChange={(e) => updateRow(list, setList, index, "name", e.target.value)} />
        <input type="number" placeholder={`Amount (${symbol})`} value={item.amount} onChange={(e) => updateRow(list, setList, index, "amount", e.target.value)} />
        <button className="btn-danger" onClick={() => { playClick(); removeRow(list, setList, index); }}>Remove</button>
      </div>
    ));

  const netWorthColor = result && result.net_worth >= 0 ? "#00ff88" : "#ff4d6d";

  return (
    <div className="page-card">
      <div className="result-header">
        <h1 className="page-title">Net Worth Tracker</h1>
        {result && (
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn-secondary" onClick={() => { playClick(); handleClear(); }}>✕ Clear</button>
            <button className="btn-secondary export-btn" onClick={() => { playClick(); exportToPDF(); }}>📄 Export PDF</button>
          </div>
        )}
      </div>
      <p className="page-subtitle">Add your assets and liabilities to calculate your true financial picture.</p>

      <div className="section-label">Assets (what you own)</div>
      {renderRows(assets, setAssets, "e.g. Savings, Car, Property")}
      <button className="btn-secondary" onClick={() => { playClick(); addRow(assets, setAssets); }} style={{ marginBottom: "20px" }}>+ Add Asset</button>

      <div className="section-label">Liabilities (what you owe)</div>
      {renderRows(liabilities, setLiabilities, "e.g. Loan, Credit Card, Mortgage")}
      <button className="btn-secondary" onClick={() => { playClick(); addRow(liabilities, setLiabilities); }} style={{ marginBottom: "20px" }}>+ Add Liability</button>

      <br />
      <button className="btn-primary" onClick={() => { playClick(); handleSubmit(); }} disabled={loading}>
        {loading ? "Calculating..." : "Calculate Net Worth"}
      </button>

      {error && <p className="error-msg">{error}</p>}

      <div id="networth-results">
        {loading ? (
          <Skeleton count={3} />
        ) : result && (
          <div>
            <div className="result-grid">
              <div className="result-card">
                <div className="label">Total Assets</div>
                <div className="value">
                  <AnimatedValue value={result.total_assets} prefix={symbol} />
                </div>
              </div>
              <div className="result-card">
                <div className="label">Total Liabilities</div>
                <div className="value" style={{ color: "#ff4d6d" }}>
                  <AnimatedValue value={result.total_liabilities} prefix={symbol} />
                </div>
              </div>
              <div className="result-card" style={{
                background: result.net_worth >= 0 ? "rgba(0,255,136,0.08)" : "rgba(255,77,109,0.08)",
                borderColor: result.net_worth >= 0 ? "rgba(0,255,136,0.3)" : "rgba(255,77,109,0.3)"
              }}>
                <div className="label" style={{ color: netWorthColor }}>Net Worth</div>
                <div className="value" style={{ color: netWorthColor }}>
                  <AnimatedValue
                    value={Math.abs(result.net_worth)}
                    prefix={result.net_worth >= 0 ? symbol : `-${symbol}`}
                  />
                </div>
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
    </div>
  );
}

export default NetWorth;