import React from "react";

export default function Skeleton({ count = 4 }) {
  return (
    <div className="result-grid" style={{ marginTop: "28px" }}>
      {Array(count).fill(0).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-line skeleton-short" />
          <div className="skeleton-line skeleton-tall" />
        </div>
      ))}
    </div>
  );
}
