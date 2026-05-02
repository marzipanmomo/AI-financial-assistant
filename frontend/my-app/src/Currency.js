import React, { useState } from "react";

const CURRENCIES = ["USD","EUR","GBP","JPY","CAD","AUD","CHF","CNY","INR","PKR","MXN","BRL","SGD","HKD","NOK","SEK","DKK","NZD","ZAR","AED"];

function Currency() {
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("PKR");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setResult(null);
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) { setError("Please enter a valid amount."); return; }
    if (fromCurrency === toCurrency) { setError("Please select two different currencies."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/currency`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(amount), from_currency: fromCurrency, to_currency: toCurrency }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setResult(null); }
      else setResult(data);
    } catch {
      setError("Could not connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-card">
      <h1 className="page-title">Currency Converter</h1>
      <p className="page-subtitle">Convert between world currencies using live exchange rates.</p>

      <div className="input-group">
        <label className="input-label">Amount</label>
        <input
          type="number"
          placeholder="e.g. 100"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="currency-row">
        <div className="input-group" style={{ flex: 1 }}>
          <label className="input-label">From</label>
          <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)}>
            {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <button className="btn-secondary swap-btn" onClick={handleSwap} title="Swap currencies">⇄</button>
        <div className="input-group" style={{ flex: 1 }}>
          <label className="input-label">To</label>
          <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)}>
            {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
        {loading ? "Converting..." : "Convert"}
      </button>

      {loading && <p className="loading">Fetching live rates...</p>}
      {error && <p className="error-msg">{error}</p>}

      {result && (
        <div className="result-grid" style={{ marginTop: "24px" }}>
          <div className="result-card">
            <div className="label">Amount</div>
            <div className="value">{result.amount} {result.from_currency}</div>
          </div>
          <div className="result-card highlight">
            <div className="label">Converted</div>
            <div className="value">{result.converted} {result.to_currency}</div>
          </div>
          <div className="result-card">
            <div className="label">Exchange Rate</div>
            <div className="value" style={{ fontSize: "15px" }}>1 {result.from_currency} = {result.rate} {result.to_currency}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Currency;