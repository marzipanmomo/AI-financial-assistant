import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Budget from "./Budget";
import Expenses from "./Expenses";
import Savings from "./Savings";
import Tips from "./Tips";

function App() {
  return (
    <Router>
      <div style={{ padding: "20px" }}>
        <h1>AI Financial Assistant</h1>
        <nav>
          <Link to="/">Home</Link> |<> </> 
          <Link to="/budget">Budget</Link> |<> </> 
          <Link to="/expenses">Expenses</Link> |<> </>  
          <Link to="/savings">Savings</Link> |<> </>  
          <Link to="/tips">Tips</Link>
        </nav>

        <Routes>
          <Route path="/" element={<p>Welcome! Choose a module.</p>} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/savings" element={<Savings />} />
          <Route path="/tips" element={<Tips />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
