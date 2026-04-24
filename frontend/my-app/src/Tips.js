import React, { useState } from "react";

function Tips() {
  const [tip, setTip] = useState("");

  const handleClick = async () => {
    const res = await fetch("http://localhost:5000/tips");
    const data = await res.json();
    setTip(data.tip);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Financial Tips</h2>
      <button onClick={handleClick}>Get Tip of the Day</button>
      <p>{tip}</p>
    </div>
  );
}

export default Tips;
