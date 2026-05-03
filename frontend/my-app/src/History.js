import React, { useState, useEffect } from "react";
import { playClick } from "./sound.js";
import { useCurrency } from "./CurrencyContext";

const MODULE_META = {
  budget:     { emoji: "💰", label: "Budget" },
  savings:    { emoji: "🎯", label: "Savings" },
  loan:       { emoji: "🏦", label: "Loan & EMI" },
  investment: { emoji: "🚀", label: "Investment" },
  networth:   { emoji: "📈", label: "Net Worth" },
  tax:        { emoji: "🧾", label: "Tax Estimator" },
};

function getKeyStat(module, result, symbol) {
  if (!result) return null;
  switch (module) {
    case "budget":     return result.remaining != null ? `${symbol}${result.remaining} remaining` : null;
    case "savings":    return result.monthly_target != null ? `${symbol}${result.monthly_target}/mo target` : null;
    case "loan":       return result.emi != null ? `${symbol}${result.emi} EMI` : null;
    case "investment": return result.future_value != null ? `${symbol}${result.future_value?.toLocaleString()} future value` : null;
    case "networth":   return result.net_worth != null ? `${symbol}${result.net_worth?.toLocaleString()} net worth` : null;
    case "tax":        return result.estimated_tax != null ? `${symbol}${result.estimated_tax?.toLocaleString()} tax` : null;
    default:           return null;
  }
}

function getFields(module, result, symbol) {
  const s = (v) => v != null ? `${symbol}${Number(v).toLocaleString()}` : "—";
  switch (module) {
    case "budget":
      return [
        { label: "Income",        value: s(result.income) },
        { label: "Total Spent",   value: s(result.total_spent) },
        { label: "Remaining",     value: s(result.remaining) },
        { label: "Savings Rate",  value: `${result.savings_rate}%` },
        result.ai_insight && { label: "AI Insight", value: result.ai_insight, wide: true },
      ];
    case "savings":
      return [
        { label: "Goal",           value: s(result.goal_amount) },
        { label: "Already Saved",  value: s(result.current_savings) },
        { label: "Monthly Target", value: s(result.monthly_target) },
        { label: "Weekly Target",  value: s(result.weekly_target) },
        { label: "Timeframe",      value: `${result.months} months` },
        result.ai_tip && { label: "AI Tip", value: result.ai_tip, wide: true },
      ];
    case "loan":
      return [
        { label: "Loan Amount",   value: s(result.principal) },
        { label: "Monthly EMI",   value: s(result.emi) },
        { label: "Total Payment", value: s(result.total_payment) },
        { label: "Total Interest",value: s(result.total_interest) },
        { label: "Duration",      value: `${result.months} months` },
        result.ai_tip && { label: "AI Tip", value: result.ai_tip, wide: true },
      ];
    case "investment":
      return [
        { label: "Future Value",     value: s(result.future_value) },
        { label: "Contributed",      value: s(result.total_contributed) },
        { label: "Total Gains",      value: s(result.total_gains) },
        { label: "ROI",              value: `${result.roi}%` },
        { label: "Annual Return",    value: `${result.annual_return}%` },
        { label: "Period",           value: `${result.years} years` },
        result.ai_insight && { label: "AI Insight", value: result.ai_insight, wide: true },
      ];
    case "networth":
      return [
        { label: "Total Assets",      value: s(result.total_assets) },
        { label: "Total Liabilities", value: s(result.total_liabilities) },
        { label: "Net Worth",         value: s(result.net_worth) },
        result.ai_insight && { label: "AI Insight", value: result.ai_insight, wide: true },
      ];
    case "tax":
      return [
        { label: "Annual Income",   value: s(result.income) },
        { label: "Taxable Income",  value: s(result.taxable_income) },
        { label: "Estimated Tax",   value: s(result.estimated_tax) },
        { label: "Effective Rate",  value: `${result.effective_rate}%` },
        { label: "Marginal Rate",   value: `${result.marginal_rate}%` },
        { label: "Monthly Take-Home", value: s(result.monthly_take_home) },
        result.ai_tip && { label: "AI Tip", value: result.ai_tip, wide: true },
      ];
    default:
      return Object.entries(result)
        .filter(([k, v]) => !k.startsWith("ai_") && typeof v !== "object")
        .map(([k, v]) => ({ label: k.replace(/_/g, " "), value: String(v) }));
  }
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function History({ user }) {
  const { symbol } = useCurrency();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/history/${user.id}`)
      .then((r) => r.json())
      .then((data) => { setHistory(data.history || []); setLoading(false); })
      .catch(() => { setError("Could not load history."); setLoading(false); });
  }, [user.id]);

  return (
    <div className="page-card">
      <h1 className="page-title">Activity History</h1>
      <p className="page-subtitle">Your last 20 calculations across all tools.</p>

      {loading && <p className="loading">Loading history...</p>}
      {error && <p className="error-msg">{error}</p>}

      {!loading && history.length === 0 && (
        <div className="ai-insight">
          <p>No history yet. Use any tool and your results will appear here automatically.</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px" }}>
        {history.map((item, i) => {
          const meta = MODULE_META[item.module] || { emoji: "📁", label: item.module };
          const stat = getKeyStat(item.module, item.result, symbol);
          const isOpen = expanded === i;
          const fields = getFields(item.module, item.result, symbol).filter(Boolean);

          return (
            <div
              key={i}
              className="result-card"
              style={{ cursor: "pointer" }}
              onClick={() => { playClick(); setExpanded(isOpen ? null : i); }}
            >
              {/* Header row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "20px" }}>{meta.emoji}</span>
                  <div>
                    <div style={{ fontWeight: "600", color: "var(--text-primary)", fontSize: "14px" }}>
                      {meta.label}
                    </div>
                    {stat && (
                      <div style={{ fontSize: "12px", color: "#00ff88", marginTop: "2px" }}>{stat}</div>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{formatDate(item.date)}</div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                    {isOpen ? "▲ hide" : "▼ details"}
                  </div>
                </div>
              </div>

              {/* Expanded detail */}
              {isOpen && (
                <div
                  style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid var(--border)" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "10px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                    Result Breakdown
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {fields.map((f, fi) =>
                      f.wide ? (
                        <div
                          key={fi}
                          style={{ padding: "10px 12px", background: "var(--accent-dim)", borderRadius: "8px", border: "1px solid var(--border-accent)", marginTop: "4px" }}
                        >
                          <div style={{ fontSize: "10px", fontWeight: "700", color: "#00ff88", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "4px" }}>
                            {f.label}
                          </div>
                          <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                            {f.value}
                          </p>
                        </div>
                      ) : (
                        <div
                          key={fi}
                          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid var(--border)" }}
                        >
                          <span style={{ fontSize: "13px", color: "var(--text-muted)", textTransform: "capitalize" }}>
                            {f.label}
                          </span>
                          <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>
                            {f.value}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default History;
