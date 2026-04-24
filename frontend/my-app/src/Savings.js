import React, { useState } from "react";

function Savings() {
  const [goal, setGoal] = useState("");
  const [months, setMonths] = useState("");
  const [result, setResult] = useState("");

  const handleSubmit = async () => {
    const res = await fetch("http://localhost:5000/savings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal, months }),
    });
    const data = await res.json();
    setResult(data.plan);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Savings Goal Planner</h2>
      <input
        type="number"
        placeholder="Savings Goal"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
      />
      <input
        type="number"
        placeholder="Months"
        value={months}
        onChange={(e) => setMonths(e.target.value)}
      />
      <button onClick={handleSubmit}>Plan</button>
      <p>{result}</p>
    </div>
  );
}

export default Savings;
