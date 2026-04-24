import React, { useState } from "react";

function Expenses() {
  const [items, setItems] = useState("");
  const [result, setResult] = useState("");

  const handleSubmit = async () => {
    const res = await fetch("http://localhost:5000/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ purchases: items }),
    });
    const data = await res.json();
    setResult(data.analysis);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Expense Analyzer</h2>
      <input
        type="text"
        placeholder="Enter purchases (e.g. Netflix, Uber)"
        value={items}
        onChange={(e) => setItems(e.target.value)}
      />
      <button onClick={handleSubmit}>Analyze</button>
      <p>{result}</p>
    </div>
  );
}

export default Expenses;
