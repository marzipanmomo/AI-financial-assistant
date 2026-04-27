import React, { useState } from "react";

function Tips() {
  const [tip, setTip] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    const res = await fetch("http://localhost:5000/api/tips");
    const data = await res.json();
    setTip(data.tip);
    setLoading(false);
  };

  return (
    <div className="page-card">
      <h1 className="page-title">Financial Tips</h1>
      <p className="page-subtitle">Get a fresh AI-generated financial tip to guide your day.</p>

      <button className="btn-primary" onClick={handleClick} disabled={loading}>
        {loading ? "Generating..." : "✦ Get Tip of the Day"}
      </button>

      {loading && <p className="loading">Fetching your daily wisdom...</p>}

      {tip && (
        <div className="tip-card">
          <div className="quote-mark">"</div>
          <p>{tip}</p>
        </div>
      )}
    </div>
  );
}

export default Tips;