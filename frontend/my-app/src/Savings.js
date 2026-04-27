import React, { useState } from "react";

function Savings() {
  const [goalAmount, setGoalAmount] = useState("");
  const [months, setMonths] = useState("");
  const [currentSavings, setCurrentSavings] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const res = await fetch("http://localhost:5000/api/savings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        goal_amount: parseFloat(goalAmount),
        months: parseInt(months),
        current_savings: parseFloat(currentSavings) || 0,
      }),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="page-card">
      <h1 className="page-title">Savings Goal Planner</h1>
      <p className="page-subtitle">Set your savings target and get a personalized plan to reach it.</p>

      <div className="input-row">
        <div className="input-group">
          <label className="input-label">Savings Goal ($)</label>
          <input
            type="number"
            placeholder="e.g. 5000"
            value={goalAmount}
            onChange={(e) => setGoalAmount(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label className="input-label">Timeframe (months)</label>
          <input
            type="number"
            placeholder="e.g. 12"
            value={months}
            onChange={(e) => setMonths(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label className="input-label">Current Savings ($)</label>
          <input
            type="number"
            placeholder="e.g. 500"
            value={currentSavings}
            onChange={(e) => setCurrentSavings(e.target.value)}
          />
        </div>
      </div>

      <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
        {loading ? "Planning..." : "Create My Plan"}
      </button>

      {loading && <p className="loading">Building your savings plan...</p>}

      {result && (
        <div>
          <div className="result-grid">
            <div className="result-card highlight">
              <div className="label">Goal</div>
              <div className="value">${result.goal_amount}</div>
            </div>
            <div className="result-card">
              <div className="label">Still Needed</div>
              <div className="value">${result.remaining_needed}</div>
            </div>
            <div className="result-card">
              <div className="label">Per Month</div>
              <div className="value">${result.monthly_target}</div>
            </div>
            <div className="result-card">
              <div className="label">Per Week</div>
              <div className="value">${result.weekly_target}</div>
            </div>
            <div className="result-card">
              <div className="label">Per Day</div>
              <div className="value">${result.daily_target}</div>
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

export default Savings;