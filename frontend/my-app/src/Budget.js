import React, { useState } from "react";

function Budget() {
    const[income, setIncome] = useState("");
    const[expenses, setExpenses] = useState("");
    const[result, setResult] = useState(null);

    const handleSubmit = async () => {
        const res = await fetch("http://localhost:5000/budget",{
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({income,expenses}),
        });
        const data = await res.json();
        setResult(data);
    };

    return(
        <div style={{ padding: "20px" }}>
            <h2>Budget Calculator</h2>
            <input
            type="number"
            placeholder="Income"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            />
            <input
            type="number"
            placeholder="Expenses"
            value={expenses}
            onChange={(e) => setExpenses(e.target.value)}
            />
            <button onClick={handleSubmit}>Calculate</button>

            {result &&(
                <div>
                    <p>Income: {result.income}</p>
                    <p>Expenses: {result.expenses}</p>
                    <p>Savings: {result.savings}</p>
                </div>
            )}
        </div>
    );
}

export default Budget;