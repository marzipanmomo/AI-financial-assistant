import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Budget from "./Budget";
import Expenses from "./Expenses";
import Savings from "./Savings";
import Tips from "./Tips";
import Loan from "./Loan";
import NetWorth from "./NetWorth";
import BillSplitter from "./BillSplitter";
import Investment from "./Investment";
import Login from "./Login";
import "./App.css";

function NavLink({ to, children }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <li>
      <Link to={to} className={isActive ? "active" : ""}>{children}</Link>
    </li>
  );
}

function Home({ user }) {
  return (
    <div className="home-hero">
      <div className="home-badge">AI-POWERED INSIGHTS</div>
      <h2>Smarter Financial<br /><span>Decisions</span> Powered by AI</h2>
      <p>Track spending, plan savings, and receive intelligent financial insights — all in one powerful AI-driven platform.</p>
      <div className="home-cards">
        <Link to="/budget" className="home-card">
          <div className="card-icon">💰</div>
          <div className="card-title">Budget</div>
          <div className="card-desc">Track income & expenses</div>
        </Link>
        <Link to="/expenses" className="home-card">
          <div className="card-icon">📊</div>
          <div className="card-title">Expenses</div>
          <div className="card-desc">Analyze your spending</div>
        </Link>
        <Link to="/savings" className="home-card">
          <div className="card-icon">🎯</div>
          <div className="card-title">Savings</div>
          <div className="card-desc">Plan your goals</div>
        </Link>
        <Link to="/tips" className="home-card">
          <div className="card-icon">💡</div>
          <div className="card-title">Tips</div>
          <div className="card-desc">Daily financial wisdom</div>
        </Link>
        <Link to="/loan" className="home-card">
          <div className="card-icon">🏦</div>
          <div className="card-title">Loan & EMI</div>
          <div className="card-desc">Calculate loan payments</div>
        </Link>
        <Link to="/networth" className="home-card">
          <div className="card-icon">📈</div>
          <div className="card-title">Net Worth</div>
          <div className="card-desc">Track your wealth</div>
        </Link>
        <Link to="/split" className="home-card">
          <div className="card-icon">🍽️</div>
          <div className="card-title">Bill Splitter</div>
          <div className="card-desc">Split bills with friends</div>
        </Link>
        <Link to="/investment" className="home-card">
          <div className="card-icon">🚀</div>
          <div className="card-title">Investment</div>
          <div className="card-desc">Calculate ROI & returns</div>
        </Link>
      </div>
    </div>
  );
}

function AppContent({ user, onLogout }) {
  return (
    <div className="app-container">
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          <div className="logo-icon">$</div>
          FinanceAI
        </Link>
        <ul className="navbar-links">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/budget">Budget</NavLink>
          <NavLink to="/expenses">Expenses</NavLink>
          <NavLink to="/savings">Savings</NavLink>
          <NavLink to="/tips">Tips</NavLink>
          <NavLink to="/loan">Loan</NavLink>
          <NavLink to="/networth">Net Worth</NavLink>
          <NavLink to="/split">Bill Split</NavLink>
          <NavLink to="/investment">Investment</NavLink>
        </ul>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ color: "#8892a4", fontSize: "13px" }}>👤 {user.username}</span>
          <button
            onClick={onLogout}
            style={{
              background: "transparent", color: "#ff4d6d",
              border: "1px solid rgba(255,77,109,0.3)",
              padding: "6px 14px", borderRadius: "8px",
              fontSize: "12px", fontWeight: "600",
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif"
            }}
          >Logout</button>
        </div>
      </nav>
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/budget" element={<Budget user={user} />} />
          <Route path="/expenses" element={<Expenses user={user} />} />
          <Route path="/savings" element={<Savings user={user} />} />
          <Route path="/tips" element={<Tips user={user} />} />
          <Route path="/loan" element={<Loan user={user} />} />
          <Route path="/networth" element={<NetWorth user={user} />} />
          <Route path="/split" element={<BillSplitter user={user} />} />
          <Route path="/investment" element={<Investment user={user} />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return <AppContent user={user} onLogout={handleLogout} />;
}

export default App;