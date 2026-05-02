import React, { useState, useRef, useEffect } from 'react';

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! I'm your AI financial assistant. Ask me anything about budgeting, investing, saving, or loans." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  const suggestions = [
    "How can I save more money?",
    "Best way to start investing?",
    "How to pay off debt faster?",
    "What's an emergency fund?"
  ];

  const sendMessage = async (messageText) => {
    const userMessage = messageText || input;
    if (!userMessage.trim() || isLoading) return;

    // Add user message to chat
    const updatedMessages = [...messages, { role: 'user', text: userMessage }];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    setStreamingText('');

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: updatedMessages.map(msg => ({
            role: msg.role,
            text: msg.text
          }))
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            if (data.trim()) {
              try {
                // Handle both quoted strings and plain text
                let text = data;
                if (data.startsWith('"') && data.endsWith('"')) {
                  text = JSON.parse(data);
                }
                fullResponse += text;
                setStreamingText(fullResponse);
              } catch (e) {
                fullResponse += data;
                setStreamingText(fullResponse);
              }
            }
          }
        }
      }

      // Add final assistant message
      setMessages(prev => [...prev, { role: 'assistant', text: fullResponse }]);
      setStreamingText('');
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: 'Sorry, I had trouble responding. Please make sure the backend server is running on port 5000.' 
      }]);
      setStreamingText('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-card chat-page">
      <h2 className="page-title">Financial Chat</h2>
      <p className="page-subtitle">Ask anything about personal finance and get instant AI-powered answers.</p>
      
      <div className="chat-suggestions">
        {suggestions.map((s, i) => (
          <button key={i} className="suggestion-chip" onClick={() => sendMessage(s)}>
            {s}
          </button>
        ))}
      </div>

      <div className="chat-window">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-bubble ${msg.role}`}>
            <div className="chat-avatar">
              {msg.role === 'user' ? '👤' : '🤖'}
            </div>
            <div className="chat-text">{msg.text}</div>
          </div>
        ))}
        
        {isLoading && streamingText && (
          <div className="chat-bubble assistant">
            <div className="chat-avatar">🤖</div>
            <div className="chat-text">{streamingText}</div>
          </div>
        )}
        
        {isLoading && !streamingText && (
          <div className="chat-bubble assistant">
            <div className="chat-avatar">🤖</div>
            <div className="chat-typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-row">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about budgeting, investing, saving..."
          disabled={isLoading}
          className="input-field"
        />
        <button onClick={() => sendMessage()} disabled={isLoading || !input.trim()} className="btn-primary">
          Send
        </button>
      </div>
    </div>
  );
}