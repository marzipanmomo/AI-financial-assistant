import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useCountUp } from './useCountUp';
import Skeleton from './Skeleton';
import { useToast } from './Toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { playClick } from "./sound.js";
import { saveHistory } from "./saveHistory";
import { useCurrency } from "./CurrencyContext";
import ModelSentimentBadge from "./ModelSentimentBadge";

const PIE_COLORS = ["#00ff88","#00bcd4","#f59e0b","#e91e63","#9c27b0","#3f51b5","#009688","#ff5722"];

// ✅ symbol passed as prop — not read from outer scope
function AnimatedValue({ value, prefix = "", suffix = "" }) {
  const displayValue = useCountUp(value, 600);
  return <span>{prefix}{displayValue.toFixed(2)}{suffix}</span>;
}

function Budget({ user }) {
  const { symbol } = useCurrency();
  const [income, setIncome] = useState(() => localStorage.getItem("budget_income") || "");
  const [expenses, setExpenses] = useState(() => {
    try { return JSON.parse(localStorage.getItem("budget_expenses")) || [{ name: "", amount: "" }]; }
    catch { return [{ name: "", amount: "" }]; }
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  useEffect(() => { localStorage.setItem("budget_income", income); }, [income]);
  useEffect(() => { localStorage.setItem("budget_expenses", JSON.stringify(expenses)); }, [expenses]);

  const handleClear = () => {
    setIncome("");
    setExpenses([{ name: "", amount: "" }]);
    setResult(null);
    setError("");
    localStorage.removeItem("budget_income");
    localStorage.removeItem("budget_expenses");
  };

  const addExpense = () => setExpenses([...expenses, { name: "", amount: "" }]);

  const updateExpense = (index, field, value) => {
    const updated = [...expenses];
    updated[index][field] = value;
    setExpenses(updated);
  };

  const removeExpense = (index) => setExpenses(expenses.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    if (!income || parseFloat(income) <= 0) { 
      setError("Please enter a valid income.");
      showToast('error', 'Please enter a valid income');
      return; 
    }
    setError("");
    setLoading(true);
    try {
      const validExpenses = expenses.filter((e) => e.name && e.amount);
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/budget`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ income: parseFloat(income), expenses: validExpenses }),
      });
      const data = await res.json();
      if (data.error) { 
        setError(data.error); 
        setResult(null);
        showToast('error', data.error);
      } else {
        setResult(data);
        showToast('success', 'Budget calculated successfully!');
        if (user) saveHistory(user.id, "budget", { income: parseFloat(income), expenses: validExpenses }, data);
      }
    } catch {
      setError("Could not connect to the server. Please try again.");
      showToast('error', 'Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    const element = document.getElementById('budget-results');
    if (!element) {
      showToast('error', 'No results to export');
      return;
    }
    
    showToast('info', 'Generating PDF...');
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#0a0f1a'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save('budget-report.pdf');
      showToast('success', 'PDF exported successfully!');
    } catch (error) {
      console.error('PDF error:', error);
      showToast('error', 'Failed to generate PDF');
    }
  };

  const pieData = result?.breakdown?.map((item) => ({ name: item.name, value: item.amount })) || [];

  return (
    <div className="page-card">
      <div className="result-header">
        <h1 className="page-title">Budget Calculator</h1>
          {result && (
            <button className="btn-secondary export-btn" onClick={() => { playClick(); exportToPDF(); }}>📄 Export PDF</button>
          )}
      </div>
      <p className="page-subtitle">Enter your income and expenses to get an AI-powered breakdown.</p>

      <div className="input-group">
        <label className="input-label">Monthly Income</label>
        <input type="number" placeholder="e.g. 3000" value={income} onChange={(e) => setIncome(e.target.value)} />
      </div>

      <div className="section-label">Expenses</div>

      {expenses.map((expense, index) => (
        <div key={index} className="expense-row">
          <input type="text" placeholder="Category (e.g. Rent)" value={expense.name} onChange={(e) => updateExpense(index, "name", e.target.value)} />
          <input type="number" placeholder={`Amount (${symbol})`} value={expense.amount} onChange={(e) => updateExpense(index, "amount", e.target.value)} />
          <button className="btn-danger" onClick={() => { playClick(); removeExpense(index); }}>Remove</button>
        </div>
      ))}

      <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
        <button className="btn-secondary" onClick={() => { playClick(); addExpense(); }}>+ Add Expense</button>
        <button className="btn-primary" onClick={() => { playClick(); handleSubmit(); }} disabled={loading}>
          {loading ? "Calculating..." : "Calculate"}
        </button>
        <button className="btn-secondary" onClick={() => { playClick(); handleClear(); }}>
          ✕ Clear
        </button>
      </div>

      {error && <p className="error-msg">{error}</p>}

      <div id="budget-results">
        {loading ? (
          <Skeleton count={4} />
        ) : result && (
          <div>
            <div className="result-grid">
              <div className="result-card">
                <div className="label">Income</div>
                <div className="value">
                  <AnimatedValue value={result.income} prefix={symbol} />
                </div>
              </div>
              <div className="result-card">
                <div className="label">Total Spent</div>
                <div className="value">
                  <AnimatedValue value={result.total_spent} prefix={symbol} />
                </div>
              </div>
              <div className="result-card highlight">
                <div className="label">Remaining</div>
                <div className="value" style={{ color: result.remaining >= 0 ? '#00ff88' : '#ff4d6d' }}>
                  <AnimatedValue value={result.remaining} prefix={symbol} />
                </div>
              </div>
              <div className="result-card">
                <div className="label">Savings Rate</div>
                <div className="value">
                  <AnimatedValue value={result.savings_rate} suffix="%" />
                </div>
              </div>
            </div>

            {pieData.length > 0 && (
              <>
                <div className="section-label">Expense Breakdown Chart</div>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={105} paddingAngle={3} dataKey="value">
                        {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v) => `${symbol}${v}`} contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", color: "#f0f4ff", fontSize: "13px" }} />
                      <Legend wrapperStyle={{ color: "#8892a4", fontSize: "12px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {result.breakdown && (
              <>
                <div className="section-label">Breakdown</div>
                <ul className="breakdown-list">
                  {result.breakdown.map((item, i) => (
                    <li key={i}>
                      <span className="item-name">{item.name}</span>
                      <span className="item-amount">{symbol}{item.amount}</span>
                      <span className="item-pct">{item.percentage}%</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {result.ai_insight && (
              <div className="ai-insight">
                <div className="ai-label">✦ AI Insight (Groq)</div>
                <p>{result.ai_insight}</p>
              </div>
            )}
            <ModelSentimentBadge sentiment={result.model_sentiment} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Budget;