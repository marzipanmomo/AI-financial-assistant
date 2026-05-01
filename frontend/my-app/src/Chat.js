import React, { useState, useRef, useEffect } from "react";

const SUGGESTIONS = [
  "How much should I save each month?",
  "What's the 50/30/20 budget rule?",
  "How do I start investing with $500?",
  "What's a good emergency fund size?",
];

function Chat() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! I'm your AI financial assistant. Ask me anything about budgeting, investing, saving, or loans." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply || data.error || "Sorry, I couldn't respond." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "Sorry, I couldn't connect to the server." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  return (
    <div className="page-card chat-page">
      <h1 className="page-title">Financial Chat</h1>
      <p className="page-subtitle">Ask anything about personal finance and get instant AI-powered answers.</p>

      {messages.length === 1 && (
        <div className="chat-suggestions">
          {SUGGESTIONS.map((s, i) => (
            <button key={i} className="suggestion-chip" onClick={() => sendMessage(s)}>{s}</button>
          ))}
        </div>
      )}

      <div className="chat-window">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble ${msg.role}`}>
            {msg.role === "assistant" && <div className="chat-avatar">✦</div>}
            <div className="chat-text">{msg.text}</div>
          </div>
        ))}
        {loading && (
          <div className="chat-bubble assistant">
            <div className="chat-avatar">✦</div>
            <div className="chat-text chat-typing"><span /><span /><span /></div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-row">
        <input
          type="text"
          placeholder="Ask about budgeting, investing, saving..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button className="btn-primary" onClick={() => sendMessage(input)} disabled={loading || !input.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;
