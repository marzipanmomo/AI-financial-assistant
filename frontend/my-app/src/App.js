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
import Chat from "./Chat";
import Currency from "./Currency";
import "./App.css";
import PageTransition from "./PageTransition";
import { AnimatePresence } from "framer-motion";
import { playClick } from "./sound.js";

function NavLink({ to, children }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <li>
      <Link to={to} className={isActive ? "active" : ""} onClick={playClick}>
      {children}
      </Link>
    </li>
  );
}

function ThemeToggle() {
  const [theme, setTheme] = React.useState(
    localStorage.getItem("theme") || "dark"
  );

  React.useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);
  
  return (
  <button
    className="btn-secondary theme-toggle"
    onClick={() => {
      setTheme(theme === "dark" ? "light" : "dark");
      playClick();
    }}>
    {theme === "dark" ? "🌞 Light" : "🌙 Dark"}
  </button> 
  );
}

function Home() {
  return (
    <div className="home-hero">
      <div className="home-badge">AI-POWERED INSIGHTS</div>
      <h2>Smarter Financial<br /><span>Decisions</span> Powered by AI</h2>
      <p>Track spending, plan savings, and receive intelligent financial insights — all in one powerful AI-driven platform.</p>
      <div className="home-cards">
        <Link to="/budget" className="home-card" onClick={playClick}>
          <div className="card-icon">💰</div>
          <div className="card-title">Budget</div>
          <div className="card-desc">Track income & expenses</div>
        </Link>
        <Link to="/expenses" className="home-card" onClick={playClick}>
          <div className="card-icon">📊</div>
          <div className="card-title">Expenses</div>
          <div className="card-desc">Analyze your spending</div>
        </Link>
        <Link to="/savings" className="home-card" onClick={playClick}>
          <div className="card-icon">🎯</div>
          <div className="card-title">Savings</div>
          <div className="card-desc">Plan your goals</div>
        </Link>
        <Link to="/tips" className="home-card" onClick={playClick}>
          <div className="card-icon">💡</div>
          <div className="card-title">Tips</div>
          <div className="card-desc">Daily financial wisdom</div>
        </Link>
        <Link to="/loan" className="home-card" onClick={playClick}>
          <div className="card-icon">🏦</div>
          <div className="card-title">Loan & EMI</div>
          <div className="card-desc">Calculate loan payments</div>
        </Link>
        <Link to="/networth" className="home-card" onClick={playClick}>
          <div className="card-icon">📈</div>
          <div className="card-title">Net Worth</div>
          <div className="card-desc">Track your wealth</div>
        </Link>
        <Link to="/split" className="home-card" onClick={playClick}>
          <div className="card-icon">🍽️</div>
          <div className="card-title">Bill Splitter</div>
          <div className="card-desc">Split bills with friends</div>
        </Link>
        <Link to="/investment" className="home-card" onClick={playClick}>
          <div className="card-icon">🚀</div>
          <div className="card-title">Investment</div>
          <div className="card-desc">Calculate ROI & returns</div>
        </Link>
        <Link to="/chat" className="home-card" onClick={playClick}>
          <div className="card-icon">✦</div>
          <div className="card-title">AI Chat</div>
          <div className="card-desc">Ask anything about finance</div>
        </Link>

        <Link to="/currency" className="home-card" onClick={playClick}>
          <div className="card-icon">💱</div>
          <div className="card-title">Currency</div>
          <div className="card-desc">Convert world currencies</div>
        </Link>
      </div>
    </div>
  );
}

function AppContent({ user, onLogout }) {
  const location = useLocation();
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
          <NavLink to="/chat">AI Chat</NavLink>
          <NavLink to="/currency">Currency</NavLink>
        </ul>

        <ThemeToggle className="theme-toggle"/>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ color: "#8892a4", fontSize: "13px", alignItems: "center", marginRight: "-6px"}}>👤 {user.username}</span>
        <button className="btn-danger" onClick={onLogout}>Logout</button>
      </div>
      </nav>
      <div className="main-content">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><Home user={user} /></PageTransition>} />
            <Route path="/budget" element={<PageTransition><Budget user={user} /></PageTransition>} />
            <Route path="/expenses" element={<PageTransition><Expenses user={user} /></PageTransition>} />
            <Route path="/savings" element={<PageTransition><Savings user={user} /></PageTransition>} />
            <Route path="/tips" element={<PageTransition><Tips user={user} /></PageTransition>} />
            <Route path="/loan" element={<PageTransition><Loan user={user} /></PageTransition>} />
            <Route path="/networth" element={<PageTransition><NetWorth user={user} /></PageTransition>} />
            <Route path="/split" element={<PageTransition><BillSplitter user={user} /></PageTransition>} />
            <Route path="/investment" element={<PageTransition><Investment user={user} /></PageTransition>} />
            <Route path="/chat" element={<PageTransition><Chat user={user} /></PageTransition>} />
            <Route path="/currency" element={<PageTransition><Currency user={user} /></PageTransition>} />
          </Routes>
        </AnimatePresence>
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