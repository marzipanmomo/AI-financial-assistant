import React from "react";

const COLOR = {
  positive: "#00ff88",
  negative: "#ff4d6d",
  neutral:  "#f59e0b",
};

const BG = {
  positive: "rgba(0,255,136,0.06)",
  negative: "rgba(255,77,109,0.06)",
  neutral:  "rgba(245,158,11,0.06)",
};

function ModelSentimentBadge({ sentiment }) {
  if (!sentiment) return null;

  const { label, emoji, confidence, probabilities } = sentiment;
  const color = COLOR[label] || "#8892a4";
  const bg    = BG[label]    || "rgba(255,255,255,0.03)";

  return (
    <div
      className="ai-insight"
      style={{
        borderColor: color,
        background: bg,
        marginTop: "12px",
      }}
    >
      <div className="ai-label" style={{ color }}>
        ⚙ Model Sentiment
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "20px" }}>{emoji}</span>
        <span style={{ color, fontWeight: 700, fontSize: "15px", letterSpacing: "0.05em" }}>
          {label.toUpperCase()}
        </span>
        <span style={{ color: "#8892a4", fontSize: "13px" }}>
          {confidence}% confidence
        </span>
      </div>
      {probabilities && (
        <div style={{ display: "flex", gap: "16px", marginTop: "8px", flexWrap: "wrap" }}>
          {Object.entries(probabilities).map(([cls, prob]) => (
            <span key={cls} style={{ fontSize: "12px", color: "#8892a4" }}>
              <span style={{ color: COLOR[cls] || "#8892a4" }}>{cls}</span>
              {" "}
              {(prob * 100).toFixed(1)}%
            </span>
          ))}
        </div>
      )}
      <p style={{ fontSize: "11px", color: "#4a5568", marginTop: "6px", marginBottom: 0 }}>
        Trained model · learns from your data
      </p>
    </div>
  );
}

export default ModelSentimentBadge;
