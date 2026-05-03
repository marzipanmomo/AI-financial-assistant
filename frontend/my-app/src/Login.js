import React, { useState } from "react";
import { playClick } from "./sound.js";

function Login({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    const endpoint = isSignup ? "/api/auth/signup" : "/api/auth/login";

    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        localStorage.setItem("user", JSON.stringify(data.user));
        onLogin(data.user);
      }
    } catch (e) {
      setError("Could not connect to server. Is the backend running?");
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080c12",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
      backgroundImage: "radial-gradient(ellipse at 20% 50%, rgba(0,255,136,0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(0,120,255,0.04) 0%, transparent 50%)"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "420px",
        padding: "0 24px"
      }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{
            width: "52px", height: "52px",
            background: "#00ff88",
            borderRadius: "14px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "24px", fontWeight: "900", color: "#000",
            margin: "0 auto 16px",
            boxShadow: "0 0 30px rgba(0,255,136,0.3)"
          }}>$</div>
          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "28px", fontWeight: "800",
            color: "#f0f4ff", letterSpacing: "-0.5px",
            marginBottom: "6px"
          }}>FinanceAI</h1>
          <p style={{ color: "#8892a4", fontSize: "14px" }}>
            {isSignup ? "Create your account to get started" : "Welcome back! Sign in to continue"}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "#111827",
          borderRadius: "20px",
          padding: "32px",
          border: "1px solid rgba(255,255,255,0.07)",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(0,255,136,0.4), transparent)"
          }} />

          <h2 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "18px", fontWeight: "700",
            color: "#f0f4ff", marginBottom: "24px",
            letterSpacing: "-0.3px"
          }}>{isSignup ? "Create Account" : "Sign In"}</h2>

          {/* Username */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{
              display: "block", fontSize: "11px", fontWeight: "600",
              color: "#4a5568", textTransform: "uppercase",
              letterSpacing: "1px", marginBottom: "7px"
            }}>Username</label>
            <input
              type="text"
              placeholder="e.g. johndoe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                width: "100%", padding: "11px 16px",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "10px", fontSize: "14px",
                background: "#0d1420", color: "#f0f4ff",
                outline: "none", fontFamily: "'DM Sans', sans-serif",
                transition: "border-color 0.2s"
              }}
              onFocus={(e) => e.target.style.borderColor = "rgba(0,255,136,0.4)"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.07)"}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{
              display: "block", fontSize: "11px", fontWeight: "600",
              color: "#4a5568", textTransform: "uppercase",
              letterSpacing: "1px", marginBottom: "7px"
            }}>Password</label>
            <input
              type="password"
              placeholder={isSignup ? "Min. 6 characters" : "Your password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                width: "100%", padding: "11px 16px",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "10px", fontSize: "14px",
                background: "#0d1420", color: "#f0f4ff",
                outline: "none", fontFamily: "'DM Sans', sans-serif",
                transition: "border-color 0.2s"
              }}
              onFocus={(e) => e.target.style.borderColor = "rgba(0,255,136,0.4)"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.07)"}
            />
          </div>

          {error && (
            <div style={{
              background: "rgba(255,77,109,0.08)",
              border: "1px solid rgba(255,77,109,0.25)",
              borderRadius: "8px", padding: "10px 14px",
              color: "#ff4d6d", fontSize: "13px", marginBottom: "16px"
            }}>{error}</div>
          )}

          <button
            onClick={() => { playClick(); handleSubmit(); }}
            disabled={loading}
            style={{
              width: "100%", background: "#00ff88", color: "#000",
              border: "none", padding: "12px",
              borderRadius: "10px", fontSize: "14px", fontWeight: "700",
              fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
              boxShadow: "0 0 20px rgba(0,255,136,0.25)",
              transition: "all 0.2s", opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? "Please wait..." : isSignup ? "Create Account" : "Sign In"}
          </button>
        </div>

        {/* Toggle */}
        <p style={{ textAlign: "center", marginTop: "20px", color: "#8892a4", fontSize: "14px" }}>
          {isSignup ? "Already have an account? " : "Don't have an account? "}
          <span
            onClick={() => { setIsSignup(!isSignup); setError(""); }}
            style={{ color: "#00ff88", cursor: "pointer", fontWeight: "600" }}
          >
            {isSignup ? "Sign In" : "Sign Up"}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;