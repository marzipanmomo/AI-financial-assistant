import React, { useState, useEffect } from "react";
import { useCountUp } from './useCountUp';
import { useToast } from './Toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { playClick } from "./sound.js";
import { useCurrency } from "./CurrencyContext";

// ✅ prefix passed as prop — no outer scope reference
function AnimatedValue({ value, prefix = "", suffix = "" }) {
  const displayValue = useCountUp(value, 600);
  return <span>{prefix}{displayValue.toFixed(2)}{suffix}</span>;
}

function Expenses() {
  const { symbol } = useCurrency();
  const [expenses, setExpenses] = useState(() => {
    try { return JSON.parse(localStorage.getItem("expenses")) || []; }
    catch { return []; }
  });
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [total, setTotal] = useState(0);
  const { showToast } = useToast();

  useEffect(() => {
    const sum = expenses.reduce((acc, exp) => acc + exp.amount, 0);
    setTotal(sum);
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  const addExpense = () => {
    if (!category || !amount || amount <= 0) {
      showToast("error", "Please enter a valid category and amount");
      return;
    }
    setExpenses([...expenses, { id: Date.now(), category, amount: parseFloat(amount) }]);
    setCategory("");
    setAmount("");
    showToast("success", "Expense added successfully!");
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter(exp => exp.id !== id));
    showToast("success", "Expense deleted");
  };

  const exportToPDF = async () => {
    const element = document.getElementById('expenses-results');
    if (!element) {
      showToast('error', 'No results to export');
      return;
    }
    showToast('info', 'Generating PDF...');
    try {
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#0a0f1a' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save('expenses-report.pdf');
      showToast('success', 'PDF exported successfully!');
    } catch (error) {
      console.error('PDF error:', error);
      showToast('error', 'Failed to generate PDF');
    }
  };

  return (
    <div className="page-card">
      <div className="result-header">
        <h2 className="page-title">Expense Tracker</h2>
        {expenses.length > 0 && (
          <button className="btn-secondary export-btn" onClick={() => { playClick(); exportToPDF(); }}>
            📄 Export PDF
          </button>
        )}
      </div>

      <div className="input-group">
        <label>Category</label>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g., Groceries, Rent, Entertainment"
        />
      </div>

      <div className="input-group">
        <label>Amount ({symbol})</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
        />
      </div>

      <button onClick={() => { playClick(); addExpense(); }} className="btn-primary">Add Expense</button>

      <div id="expenses-results">
        <div className="result-card" style={{ marginTop: "24px" }}>
          <div className="label">Total Expenses</div>
          <div className="value" style={{ color: '#ff4d6d' }}>
            <AnimatedValue value={total} prefix={symbol} />
          </div>
        </div>

        {expenses.length > 0 && (
          <ul className="breakdown-list" style={{ marginTop: "20px" }}>
            {expenses.map(exp => (
              <li key={exp.id}>
                <span className="item-name">{exp.category}</span>
                <span className="item-amount">{symbol}{exp.amount.toFixed(2)}</span>
                <button
                  className="btn-danger"
                  style={{ padding: "4px 12px", fontSize: "12px" }}
                  onClick={() => { playClick(); deleteExpense(exp.id); }}
                >Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Expenses;