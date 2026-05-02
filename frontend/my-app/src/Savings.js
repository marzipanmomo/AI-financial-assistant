import React, { useState, useEffect } from "react";
import { useCountUp } from './useCountUp';
import Skeleton from './Skeleton';
import { useToast } from './Toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { playClick } from "./sound.js";

function AnimatedValue({ value, prefix = "$" }) {
  const displayValue = useCountUp(value, 600);
  return <span>{prefix}{displayValue.toFixed(2)}</span>;
}

function Savings() {
  const [goalAmount, setGoalAmount] = useState(() => localStorage.getItem("sav_goal") || "");
  const [months, setMonths] = useState(() => localStorage.getItem("sav_months") || "");
  const [currentSavings, setCurrentSavings] = useState(() => localStorage.getItem("sav_current") || "");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  useEffect(() => { localStorage.setItem("sav_goal", goalAmount); }, [goalAmount]);
  useEffect(() => { localStorage.setItem("sav_months", months); }, [months]);
  useEffect(() => { localStorage.setItem("sav_current", currentSavings); }, [currentSavings]);

  const handleSubmit = async () => {
    if (!goalAmount || parseFloat(goalAmount) <= 0) { 
      setError("Please enter a valid savings goal.");
      showToast('error', 'Please enter a valid savings goal');
      return; 
    }
    if (!months || parseInt(months) <= 0) { 
      setError("Please enter a valid timeframe.");
      showToast('error', 'Please enter a valid timeframe');
      return; 
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/savings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal_amount: parseFloat(goalAmount),
          months: parseInt(months),
          current_savings: parseFloat(currentSavings) || 0,
        }),
      });
      const data = await res.json();
      if (data.error) { 
        setError(data.error); 
        setResult(null);
        showToast('error', data.error);
      } else {
        setResult(data);
        showToast('success', 'Savings plan created successfully!');
      }
    } catch {
      setError("Could not connect to the server. Please try again.");
      showToast('error', 'Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    const element = document.getElementById('savings-results');
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
      pdf.save('savings-plan.pdf');
      showToast('success', 'PDF exported successfully!');
    } catch (error) {
      console.error('PDF error:', error);
      showToast('error', 'Failed to generate PDF');
    }
  };

  return (
    <div className="page-card">
      <div className="result-header">
        <h1 className="page-title">Savings Goal Planner</h1>
        {result && (
          <button className="btn-secondary export-btn" onClick={exportToPDF}  onClick={playClick}>
            📄 Export PDF
          </button>
        )}
      </div>
      <p className="page-subtitle">Set your savings target and get a personalized plan to reach it.</p>

      <div className="input-row">
        <div className="input-group">
          <label className="input-label">Savings Goal ($)</label>
          <input type="number" placeholder="e.g. 5000" value={goalAmount} onChange={(e) => setGoalAmount(e.target.value)} />
        </div>
        <div className="input-group">
          <label className="input-label">Timeframe (months)</label>
          <input type="number" placeholder="e.g. 12" value={months} onChange={(e) => setMonths(e.target.value)} />
        </div>
        <div className="input-group">
          <label className="input-label">Current Savings ($)</label>
          <input type="number" placeholder="e.g. 500" value={currentSavings} onChange={(e) => setCurrentSavings(e.target.value)} />
        </div>
      </div>

      <button className="btn-primary" onClick={handleSubmit} disabled={loading} onClick={playClick}>
        {loading ? "Planning..." : "Create My Plan"}
      </button>

      {error && <p className="error-msg">{error}</p>}

      <div id="savings-results">
        {loading ? (
          <Skeleton count={5} />
        ) : result && (
          <div>
            <div className="result-grid">
              <div className="result-card highlight">
                <div className="label">Goal</div>
                <div className="value">
                  <AnimatedValue value={result.goal_amount} />
                </div>
              </div>
              <div className="result-card">
                <div className="label">Still Needed</div>
                <div className="value">
                  <AnimatedValue value={result.remaining_needed} />
                </div>
              </div>
              <div className="result-card">
                <div className="label">Per Month</div>
                <div className="value">
                  <AnimatedValue value={result.monthly_target} />
                </div>
              </div>
              <div className="result-card">
                <div className="label">Per Week</div>
                <div className="value">
                  <AnimatedValue value={result.weekly_target} />
                </div>
              </div>
              <div className="result-card">
                <div className="label">Per Day</div>
                <div className="value">
                  <AnimatedValue value={result.daily_target} />
                </div>
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

export default Savings;