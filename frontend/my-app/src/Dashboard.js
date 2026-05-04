import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { playClick } from "./sound.js";
import { useCurrency } from "./CurrencyContext";

const TOOLS = [
  { to: "/budget",     emoji: "💰", title: "Budget",      desc: "Track income & expenses" },
  { to: "/expenses",   emoji: "📊", title: "Expenses",    desc: "Log your spending" },
  { to: "/savings",    emoji: "🎯", title: "Savings",     desc: "Plan your goals" },
  { to: "/loan",       emoji: "🏦", title: "Loan & EMI",  desc: "Calculate payments" },
  { to: "/networth",   emoji: "📈", title: "Net Worth",   desc: "Track your wealth" },
  { to: "/investment", emoji: "🚀", title: "Investment",  desc: "Calculate returns" },
  { to: "/chat",       emoji: "✦",  title: "AI Chat",     desc: "Ask anything" },
  { to: "/tax",        emoji: "🧾", title: "Tax",         desc: "Estimate your tax" },
  { to: "/sentiment",  emoji: "📡", title: "Sentiment",   desc: "Analyze news" },
  { to: "/currency",   emoji: "💱", title: "Currency",    desc: "Convert currencies" },
  { to: "/split",      emoji: "🍽️", title: "Bill Split",  desc: "Split with friends" },
  { to: "/tips",       emoji: "💡", title: "Tips",        desc: "Daily wisdom" },
];

const MODULE_META = {
  budget:     { emoji: "💰", label: "Budget" },
  savings:    { emoji: "🎯", label: "Savings" },
  loan:       { emoji: "🏦", label: "Loan & EMI" },
  investment: { emoji: "🚀", label: "Investment" },
  networth:   { emoji: "📈", label: "Net Worth" },
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function Dashboard({ user }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { symbol } = useCurrency();
  const [tip, setTip] = useState("");
  const [tipLoading, setTipLoading] = useState(false);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/history/${user.id}`)
      .then((r) => r.json())
      .then((data) => { setHistory(data.history || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user.id]);

  const fetchTip = async () => {
    setTipLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/tips`);
      const data = await res.json();
      setTip(data.tip || "");
    } catch {}
    setTipLoading(false);
  };

  // Latest result per module from history
  const latestByModule = {};
  history.forEach((item) => {
    if (!latestByModule[item.module]) latestByModule[item.module] = item;
  });

  const bud  = latestByModule["budget"]?.result;
  const nw   = latestByModule["networth"]?.result;
  const sav  = latestByModule["savings"]?.result;
  const inv  = latestByModule["investment"]?.result;
  const loan = latestByModule["loan"]?.result;

  const hasStats = bud || nw || sav || inv || loan;

  return (
    <div className="page-card">
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Welcome back, {user.username}. Here's your financial snapshot.</p>

      {/* Snapshot Stats */}
      {!loading && hasStats && (
        <>
          <div className="section-label" style={{ marginTop: "8px" }}>Latest Snapshot</div>
          <div className="result-grid" style={{ marginTop: "10px" }}>
            {bud && (
              <Link to="/budget" style={{ textDecoration: "none" }} onClick={playClick}>
                <div className="result-card" style={{ cursor: "pointer" }}>
                  <div className="label">Budget Remaining</div>
                  <div className="value" style={{ color: bud.remaining >= 0 ? "#00ff88" : "#ff4d6d", fontSize: "18px" }}>
                    {symbol}{bud.remaining?.toLocaleString()}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>{bud.savings_rate}% savings rate</div>
                </div>
              </Link>
            )}
            {nw && (
              <Link to="/networth" style={{ textDecoration: "none" }} onClick={playClick}>
                <div className="result-card" style={{ cursor: "pointer" }}>
                  <div className="label">Net Worth</div>
                  <div className="value" style={{ color: nw.net_worth >= 0 ? "#00ff88" : "#ff4d6d", fontSize: "18px" }}>
                    {symbol}{nw.net_worth?.toLocaleString()}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>assets − liabilities</div>
                </div>
              </Link>
            )}
            {sav && (
              <Link to="/savings" style={{ textDecoration: "none" }} onClick={playClick}>
                <div className="result-card" style={{ cursor: "pointer" }}>
                  <div className="label">Monthly Savings Target</div>
                  <div className="value" style={{ fontSize: "18px" }}>{symbol}{sav.monthly_target?.toLocaleString()}</div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>goal: {symbol}{sav.goal_amount?.toLocaleString()}</div>
                </div>
              </Link>
            )}
            {inv && (
              <Link to="/investment" style={{ textDecoration: "none" }} onClick={playClick}>
                <div className="result-card" style={{ cursor: "pointer" }}>
                  <div className="label">Investment Future Value</div>
                  <div className="value" style={{ color: "#00ff88", fontSize: "18px" }}>{symbol}{inv.future_value?.toLocaleString()}</div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>{inv.roi}% ROI</div>
                </div>
              </Link>
            )}
            {loan && (
              <Link to="/loan" style={{ textDecoration: "none" }} onClick={playClick}>
                <div className="result-card" style={{ cursor: "pointer" }}>
                  <div className="label">Loan EMI</div>
                  <div className="value" style={{ fontSize: "18px" }}>{symbol}{loan.emi}/mo</div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>total interest: {symbol}{loan.total_interest?.toLocaleString()}</div>
                </div>
              </Link>
            )}
          </div>
        </>
      )}

      {!loading && !hasStats && (
        <div className="ai-insight" style={{ marginTop: "16px" }}>
          <p>No data yet — use any tool below and your stats will appear here automatically.</p>
        </div>
      )}

      {/* Recent Activity */}
      {history.length > 0 && (
        <div style={{ marginTop: "28px" }}>
          <div className="section-label">Recent Activity</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "10px" }}>
            {history.slice(0, 5).map((item, i) => {
              const meta = MODULE_META[item.module] || { emoji: "📁", label: item.module };
              return (
                <div key={i} className="result-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px" }}>
                  <span style={{ fontSize: "14px" }}>{meta.emoji} <span style={{ color: "var(--text-primary)", fontWeight: "500" }}>{meta.label}</span></span>
                  <span style={{ color: "var(--text-secondary)", fontSize: "12px" }}>{formatDate(item.date)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Access */}
      <div style={{ marginTop: "28px" }}>
        <div className="section-label">Quick Access</div>
        <div className="home-cards" style={{ marginTop: "10px" }}>
          {TOOLS.map((t) => (
            <Link key={t.to} to={t.to} className="home-card" onClick={playClick}>
              <div className="card-icon">{t.emoji}</div>
              <div className="card-title">{t.title}</div>
              <div className="card-desc">{t.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Daily Tip */}
      <div style={{ marginTop: "28px" }}>
        <div className="section-label">Daily Tip</div>
        <button
          className="btn-secondary"
          style={{ marginTop: "10px" }}
          onClick={() => { playClick(); fetchTip(); }}
          disabled={tipLoading}
        >
          {tipLoading ? "Loading..." : "✦ Get a Financial Tip"}
        </button>
        {tip && (
          <div className="ai-insight" style={{ marginTop: "12px" }}>
            <div className="ai-label">✦ Tip</div>
            <p>{tip}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
