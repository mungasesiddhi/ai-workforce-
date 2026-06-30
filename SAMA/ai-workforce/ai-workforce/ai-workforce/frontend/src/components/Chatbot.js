import React, { useState } from "react";
import { MessageSquare, X, Send, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "../config";
import "./Chatbot.css";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! I am your CareerNav AI Assistant. How can I help you with your career planning today?" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = { sender: "user", text: "User: " + input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const token = localStorage.getItem("career_token");
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({ message: input })
      });

      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { sender: "bot", text: "I'm having trouble connecting right now." }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { sender: "bot", text: "Error connecting to AI core." }]);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button 
        className="chatbot-fab"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <MessageSquare size={24} />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="chatbot-window glass-panel"
          >
            <div className="chatbot-header">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Bot size={20} />
                <h4>AI Assistant</h4>
              </div>
              <button onClick={() => setIsOpen(false)}><X size={18} /></button>
            </div>
            
            <div className="chatbot-messages">
              {messages.map((msg, idx) => (
                <div key={idx} className={`chat-bubble ${msg.sender}`}>
                  {msg.text}
                </div>
              ))}
            </div>

            <div className="chatbot-input">
              <input 
                type="text" 
                placeholder="Ask about careers or skills..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button onClick={handleSend}><Send size={18} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
