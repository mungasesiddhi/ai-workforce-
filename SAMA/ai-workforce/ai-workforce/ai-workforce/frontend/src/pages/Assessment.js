import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ClipboardList, BrainCircuit, Code2, MessageSquare, Send, Info } from "lucide-react";
import { motion } from "framer-motion";
import { API_URL } from "../config";
import "./Assessment.css";

const skills = [
  {
    key: "ai",
    label: "AI Neural Frameworks",
    desc: "Experience with ML models, data science pipelines, and Generative AI",
    icon: BrainCircuit,
    color: "#a855f7",
  },
  {
    key: "coding",
    label: "Core Architecture",
    desc: "Proficiency in algorithms, software systems, and complex programming constraints",
    icon: Code2,
    color: "#3b82f6",
  },
  {
    key: "communication",
    label: "Cross-Functional Synergy",
    desc: "Agile workflows, stakeholder translation, and technical product documentation",
    icon: MessageSquare,
    color: "#10b981",
  },
];

export default function Assessment() {
  const navigate = useNavigate();
  const location = useLocation();

  const [values, setValues] = useState({ ai: 5, coding: 5, communication: 5 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state && location.state.prefill) {
       setValues({
          ai: location.state.prefill.ai || 5,
          coding: location.state.prefill.coding || 5,
          communication: location.state.prefill.communication || 5
       });
    }
  }, [location.state]);

  const handleChange = (key, val) => {
    const num = Math.min(10, Math.max(0, Number(val) || 0));
    setValues((prev) => ({ ...prev, [key]: num }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const token = localStorage.getItem("career_token");
    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          AI_Skill: values.ai,
          Coding_Skill: values.coding,
          Communication_Skill: values.communication,
        }),
      });
      if (!response.ok) {
        if (response.status === 401) {
           navigate("/"); // redirect to login on token expire
           return;
        }
        throw new Error("Failed prediction");
      }
      const data = await response.json();
      navigate("/score", { state: data });
    } catch (err) {
      console.error("Prediction error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="assessment-page"
    >
      <div className="page-header">
        <div className="page-header-icon">
          <ClipboardList size={26} strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-gradient">Neural Capability Assessment</h1>
          <p>Initialize baseline metrics so our continuous model can calibrate your path.</p>
        </div>
      </div>

      <div className="assessment-tip glass-panel">
        <Info size={18} color="#a78bfa" className="shrink-0" />
        <span>Ensure input metrics are highly precise. Random forest variance algorithms will process these arrays instantly.</span>
      </div>

      <div className="skill-cards">
        {skills.map(({ key, label, desc, icon: Icon, color }, i) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="skill-card glass-panel" 
            key={key}
          >
            <div className="skill-card-header">
              <div className="skill-icon" style={{ background: `${color}15`, color, border: `1px solid ${color}40` }}>
                <Icon size={22} strokeWidth={2} />
              </div>
              <div>
                <h3 style={{ color: "#f8fafc" }}>{label}</h3>
                <p>{desc}</p>
              </div>
            </div>

            <div className="skill-slider-area">
              <input
                type="range"
                min="1"
                max="10"
                value={values[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                className="skill-range"
                style={{ "--range-color": color }}
              />
              <div className="skill-labels">
                <span>L 1.0</span>
                <span className="skill-value" style={{ color, textShadow: `0 0 10px ${color}60` }}>{values[key]}.0</span>
                <span>L 10.0</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="assessment-submit">
        <button className="btn-primary btn-lg" onClick={handleSubmit} disabled={loading}>
          {loading ? "Processing Vectors..." : "Run Career Prediction Matrix"}
          {!loading && <Send size={18} />}
        </button>
      </div>
    </motion.div>
  );
}