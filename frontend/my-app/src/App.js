import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import Budget from "./Budget";
import Expenses from "./Expenses";
import Savings from "./Savings";
import Tips from "./Tips";
import Loan from "./Loan";
import NetWorth from "./NetWorth";
import BillSplitter from "./BillSplitter";
import Investment from "./Investment";
import Chat from "./Chat";
import Currency from "./Currency";
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
    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
    {theme === "dark" ? "🌞 Light" : "🌙 Dark"}
    </button>
  );
}

function Home() {
  return (
    <div className="home-hero">
      <h2>AI Financial Assistant</h2>
      <p>Smart tools to manage your money, powered by AI.</p>
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
        <Link to="/chat" className="home-card">
          <div className="card-icon">✦</div>
          <div className="card-title">AI Chat</div>
          <div className="card-desc">Ask anything about finance</div>
        </Link>
        <Link to="/currency" className="home-card">
          <div className="card-icon">💱</div>
          <div className="card-title">Currency</div>
          <div className="card-desc">Convert world currencies</div>
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
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
          <ThemeToggle />
        </nav>
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/savings" element={<Savings />} />
            <Route path="/tips" element={<Tips />} />
            <Route path="/loan" element={<Loan />} />
            <Route path="/networth" element={<NetWorth />} />
            <Route path="/split" element={<BillSplitter />} />
            <Route path="/investment" element={<Investment />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/currency" element={<Currency />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
