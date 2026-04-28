import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const PIE_COLORS = ["#00ff88","#00bcd4","#f59e0b","#e91e63","#9c27b0","#3f51b5","#009688","#ff5722"];

function Budget() {
  const [income, setIncome] = useState(() => localStorage.getItem("budget_income") || "");
  const [expenses, setExpenses] = useState(() => {
    try { return JSON.parse(localStorage.getItem("budget_expenses")) || [{ name: "", amount: "" }]; }
    catch { return [{ name: "", amount: "" }]; }
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { localStorage.setItem("budget_income", income); }, [income]);
  useEffect(() => { localStorage.setItem("budget_expenses", JSON.stringify(expenses)); }, [expenses]);

  const addExpense = () => setExpenses([...expenses, { name: "", amount: "" }]);

  const updateExpense = (index, field, value) => {
    const updated = [...expenses];
    updated[index][field] = value;
    setExpenses(updated);
  };

  const removeExpense = (index) => setExpenses(expenses.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    if (!income || parseFloat(income) <= 0) { setError("Please enter a valid income."); return; }
    setError("");
    setLoading(true);
    try {
      const validExpenses = expenses.filter((e) => e.name && e.amount);
      const res = await fetch("http://localhost:5000/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ income: parseFloat(income), expenses: validExpenses }),
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

  const pieData = result?.breakdown?.map((item) => ({ name: item.name, value: item.amount })) || [];

  return (
    <div className="page-card">
      <h1 className="page-title">Budget Calculator</h1>
      <p className="page-subtitle">Enter your income and expenses to get an AI-powered breakdown.</p>

      <div className="input-group">
        <label className="input-label">Monthly Income</label>
        <input type="number" placeholder="e.g. 3000" value={income} onChange={(e) => setIncome(e.target.value)} />
      </div>

      <div className="section-label">Expenses</div>

      {expenses.map((expense, index) => (
        <div key={index} className="expense-row">
          <input type="text" placeholder="Category (e.g. Rent)" value={expense.name} onChange={(e) => updateExpense(index, "name", e.target.value)} />
          <input type="number" placeholder="Amount ($)" value={expense.amount} onChange={(e) => updateExpense(index, "amount", e.target.value)} />
          <button className="btn-danger" onClick={() => removeExpense(index)}>Remove</button>
        </div>
      ))}

      <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
        <button className="btn-secondary" onClick={addExpense}>+ Add Expense</button>
        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Calculating..." : "Calculate"}
        </button>
      </div>

      {loading && <p className="loading">Generating AI insights...</p>}
      {error && <p className="error-msg">{error}</p>}

      {result && (
        <div>
          <div className="result-grid">
            <div className="result-card">
              <div className="label">Income</div>
              <div className="value">${result.income}</div>
            </div>
            <div className="result-card">
              <div className="label">Total Spent</div>
              <div className="value">${result.total_spent}</div>
            </div>
            <div className="result-card highlight">
              <div className="label">Remaining</div>
              <div className="value">${result.remaining}</div>
            </div>
            <div className="result-card">
              <div className="label">Savings Rate</div>
              <div className="value">{result.savings_rate}%</div>
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
                    <Tooltip formatter={(v) => `$${v}`} contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", color: "#f0f4ff", fontSize: "13px" }} />
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
                    <span className="item-amount">${item.amount}</span>
                    <span className="item-pct">{item.percentage}%</span>
                  </li>
                ))}
              </ul>
            </>
          )}

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

export default Budget;
