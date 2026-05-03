import React, { useState } from "react";
import { playClick } from "./sound.js";
import "./SentimentAnalyzer.css";

const colorMap = {
  positive: "#00ff88",
  negative: "#ff4d6d",
  neutral:  "#f59e0b",
};

const bgMap = {
  positive: "rgba(0,255,136,0.06)",
  negative: "rgba(255,77,109,0.06)",
  neutral:  "rgba(245,158,11,0.06)",
};

const SentimentAnalyzer = () => {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzeSentiment = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("http://localhost:5000/analyze-sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      if (!response.ok) setError(data.error || "Something went wrong.");
      else setResult(data);
    } catch {
      setError("Could not connect to the server. Is Flask running?");
    }
    setLoading(false);
  };

  const handleClear = () => {
    setText(""); setResult(null); setError("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.ctrlKey) analyzeSentiment();
  };

  return (
    <div className="page-card">
      <div className="result-header">
        <div>
          <h1 className="page-title">Sentiment Analyzer</h1>
        </div>
        {result && (
          <button className="btn-secondary" onClick={() => { playClick(); handleClear(); }}>
            ✕ Clear
          </button>
        )}
      </div>
      <p className="page-subtitle">
        Analyze the sentiment of any financial statement or news headline using a trained ML model.
      </p>

      <div className="sa-model-badge">
        <span className="sa-badge-dot" />
        TF-IDF + Logistic Regression · Local Model
      </div>

      <div className="input-group" style={{ marginTop: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "7px" }}>
          <label className="input-label" style={{ margin: 0 }}>Financial Text</label>
          <span style={{ fontSize: "11px", color: text.length > 400 ? "#ff4d6d" : "#4a5568" }}>
            {text.length} / 500
          </span>
        </div>
        <textarea
          className="sa-textarea"
          rows={4}
          maxLength={500}
          placeholder="e.g. 'Inflation fears drive markets lower as Fed signals further rate hikes...'"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <p style={{ fontSize: "11px", color: "#4a5568", marginTop: "5px", marginBottom: 0 }}>
          Ctrl + Enter to analyze
        </p>
      </div>

      <button
        className="btn-primary"
        style={{ marginTop: "4px" }}
        onClick={() => { playClick(); analyzeSentiment(); }}
        disabled={loading || !text.trim()}
      >
        {loading ? "Analyzing..." : "✦ Analyze Sentiment"}
      </button>

      {error && <p className="error-msg" style={{ marginTop: "12px" }}>{error}</p>}

      {result && (
        <div
          className="sa-result"
          style={{
            borderColor: colorMap[result.sentiment],
            background: bgMap[result.sentiment],
          }}
        >
          {/* Main verdict */}
          <div className="sa-verdict">
            <span className="sa-emoji">{result.emoji}</span>
            <div>
              <div
                className="sa-label"
                style={{ color: colorMap[result.sentiment] }}
              >
                {result.sentiment.toUpperCase()}
              </div>
              <div className="sa-confidence">{result.confidence}% confidence</div>
            </div>
            <div
              className="sa-badge"
              style={{
                background: colorMap[result.sentiment],
                color: result.sentiment === "neutral" ? "#000" : "#000",
              }}
            >
              {result.confidence >= 80 ? "High" : result.confidence >= 60 ? "Medium" : "Low"}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "16px 0" }} />

          {/* Probability bars */}
          <div className="sa-prob-title">Score Breakdown</div>
          <div className="sa-probabilities">
            {Object.entries(result.probabilities)
              .sort(([, a], [, b]) => b - a)
              .map(([cls, prob]) => (
                <div key={cls} className="sa-prob-row">
                  <span className="sa-prob-label" style={{ color: colorMap[cls] }}>
                    {cls.charAt(0).toUpperCase() + cls.slice(1)}
                  </span>
                  <div className="sa-bar-bg">
                    <div
                      className="sa-bar-fill"
                      style={{
                        width: `${(prob * 100).toFixed(1)}%`,
                        background: colorMap[cls],
                        boxShadow: `0 0 8px ${colorMap[cls]}55`,
                      }}
                    />
                  </div>
                  <span className="sa-prob-value">{(prob * 100).toFixed(1)}%</span>
                </div>
              ))}
          </div>

          {/* Input echo */}
          <div style={{ marginTop: "16px", padding: "10px 14px", background: "rgba(0,0,0,0.2)", borderRadius: "8px" }}>
            <div style={{ fontSize: "10px", color: "#4a5568", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "4px" }}>
              Analyzed Text
            </div>
            <div style={{ fontSize: "13px", color: "#8892a4", lineHeight: "1.5", fontStyle: "italic" }}>
              "{result.input}"
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SentimentAnalyzer;
