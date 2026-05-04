import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, AlertCircle } from 'lucide-react';
import './ChatAssistant.css';

export default function ChatAssistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Jai Hind! 🇮🇳 Main hoon VoteGyaan — aapka chunav shiksha saathi!\n\nAap kya jaanna chahte hain?\n1️⃣ Voter ID kaise banaye?\n2️⃣ EVM aur VVPAT kya hai?\n3️⃣ Polling Day pe kya karna hai?\n4️⃣ Matganana (vote counting) kaise hoti hai?\n5️⃣ Apne adhikar jaano (Know Your Rights)\n\nKuch bhi puchho — English ya Hinglish mein! 🗳️"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Use a stable session ID per component lifecycle to maintain history on backend
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    setError(null);

    try {
      // In development, target localhost:8080. In production, this should be the relative or full API path.
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, sessionId })
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err) {
      console.error(err);
      setError("Connection error. Is the backend running?");
    } finally {
      setIsLoading(false);
      // Focus input after sending
      inputRef.current?.focus();
    }
  };

  // Convert basic markdown to formatted text safely
  const formatMessage = (text) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        <br />
      </span>
    ));
  };

  return (
    <div className="chat-container animate-fade-in">
      <h1 className="page-title">Smart Q&A Assistant</h1>
      
      <div className="chat-interface glass-panel" role="region" aria-label="Chat interface">
        <div className="chat-messages" role="log" aria-live="polite" aria-atomic="false">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-wrapper ${msg.role}`} role="article" aria-label={`${msg.role} message`}>
              <div className="message-avatar" aria-hidden="true">
                {msg.role === 'assistant' ? <Bot size={20} color="var(--saffron)" /> : <User size={20} />}
              </div>
              <div className={`message-bubble ${msg.role}`}>
                {formatMessage(msg.content)}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="message-wrapper assistant" role="status" aria-label="Assistant is typing">
              <div className="message-avatar" aria-hidden="true">
                <Bot size={20} color="var(--saffron)" />
              </div>
              <div className="message-bubble assistant typing-indicator" aria-label="Typing indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}

          {error && (
            <div className="error-banner" role="alert" aria-live="assertive">
              <AlertCircle size={16} aria-hidden="true" /> {error}
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-area" onSubmit={handleSend} role="form" aria-label="Chat input form">
          <label htmlFor="chat-input" className="visually-hidden">Type your message</label>
          <input
            id="chat-input"
            ref={inputRef}
            type="text"
            className="chat-input glass-panel"
            placeholder="Ask about EVM, Voter ID, NOTA..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            maxLength={1000}
            aria-describedby="chat-input-help"
          />
          <span id="chat-input-help" className="visually-hidden">
            Type your question about Indian elections and press Enter or click Send
          </span>
          <button 
            type="submit" 
            className="chat-send-btn btn-primary" 
            disabled={isLoading || !input.trim()}
            aria-label="Send message"
          >
            <Send size={18} aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
}
