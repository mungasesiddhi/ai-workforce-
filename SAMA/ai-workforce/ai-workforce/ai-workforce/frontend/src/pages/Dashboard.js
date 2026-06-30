import React, { useState } from "react";
import { CheckCircle2, ChevronRight, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";
import { API_URL } from "../config";
import "./Dashboard.css";

const questions = [
  { id: "q1", text: "1. Which subject do you enjoy the most?", options: ["Mathematics & Statistics", "Computer & Technology", "Business, Management & Communication"] },
  { id: "q2", text: "2. What type of problem do you like solving?", options: ["Logical and Numerical Problems", "Technical and Computer Problems", "Business and Real-World Problems"] },
  { id: "q3", text: "3. Which activity interests you the most?", options: ["Analyzing Data and Numbers", "Building Software and Technology", "Managing People and Projects"] },
  { id: "q4", text: "4. How comfortable are you with Mathematics?", options: ["Very Comfortable", "Average", "Not Comfortable"] },
  { id: "q5", text: "5. What kind of work would you prefer?", options: ["Research and Analysis", "Technical Development", "Leadership and Management"] },
  { id: "q6", text: "6. Which skill would you like to learn in the future?", options: ["Data Analytics & AI", "Programming & Software Development", "Business & Management Skills"] },
  { id: "q7", text: "7. What is most important in your future career?", options: ["Innovation and Learning", "Technology and Problem Solving", "Leadership and Growth"] },
  { id: "q8", text: "8. How interested are you in learning new technologies?", options: ["Highly Interested", "Moderately Interested", "Slightly Interested"] },
  { id: "q9", text: "9. Which role would you choose in a college project?", options: ["Data Analyst", "Developer/Programmer", "Team Leader/Coordinator"] },
  { id: "q10", text: "10. Where do you see yourself after 10 years?", options: ["Researching and Analyzing Information", "Building Technology Solutions", "Leading Teams and Organizations"] },
];

export default function Dashboard() {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchCareer, setSearchCareer] = useState("");
  const [careerSkills, setCareerSkills] = useState(null);

  const handleCareerSearch = async () => {
    if (!searchCareer) return;
    try {
      const res = await fetch(`${API_URL}/career_skills`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ career: searchCareer }),
      });
      const data = await res.json();
      setCareerSkills(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (q, val) => {
    setAnswers({ ...answers, [q]: val });
  };

  const isAllAnswered = questions.every((q) => answers[q.id] !== undefined);

  const handleSubmit = async () => {
    if (!isAllAnswered) return;
    
    setLoading(true);
    let ai = 0, coding = 0, comm = 0;
    
    questions.forEach((q) => {
      if (answers[q.id] === 0) ai += 1;
      else if (answers[q.id] === 1) coding += 1;
      else if (answers[q.id] === 2) comm += 1;
    });

    const token = localStorage.getItem("career_token");
    const payload = {
      AI_Skill: ai,
      Coding_Skill: coding,
      Communication_Skill: comm,
    };

    try {
      const res = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
         if (res.status === 401) window.location.href = "/";
         throw new Error("API failed");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Prediction error:", err);
    } finally {
      setLoading(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: "spring" } }
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div className="page-header-icon">
          <LayoutDashboard size={26} strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-gradient">Diagnostic Matrix</h1>
          <p>Answer 10 key diagnostic questions to unveil your optimal role.</p>
        </div>
      </div>

      <div className="dashboard-layout">
        {/* Left: Questions */}
        <motion.div variants={container} initial="hidden" animate="show" className="quiz-container">
          {questions.map((q, idx) => (
            <motion.div variants={item} className={`quiz-card glass-panel ${answers[q.id] ? "answered" : ""}`} key={q.id}>
              <div className="quiz-question">
                <p>{q.text}</p>
                {answers[q.id] !== undefined && <CheckCircle2 size={18} className="q-check" color="#a78bfa" />}
              </div>
              <div className="quiz-options">
                {q.options.map((opt, oIdx) => (
                  <button
                    key={oIdx}
                    className={answers[q.id] === oIdx ? "selected" : ""}
                    onClick={() => handleChange(q.id, oIdx)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </motion.div>
          ))}

          <motion.div variants={item} className="quiz-footer">
            <button 
              className="btn-primary" 
              onClick={handleSubmit} 
              disabled={!isAllAnswered || loading}
            >
              {loading ? "Computing Tensors..." : "Run Global Inference"}
              {!loading && <ChevronRight size={18} />}
            </button>
            {!isAllAnswered && <span className="quiz-hint">Matrix incomplete. Fill all fields.</span>}
          </motion.div>
        </motion.div>

        {/* Right: Results Sticky Panel */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="result-container">
          <div className="result-sticky-card glass-panel">
            {result ? (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="result-content">
                <div className="result-success-icon">
                  <CheckCircle2 size={36} color="#c4b5fd" />
                </div>
                <h3>Optimized Deployment</h3>
                <h2 className="text-gradient">{result.career}</h2>
                <div className="result-scores">
                  <div className="r-score"><span>AI Vector:</span> <strong style={{ color: '#a855f7' }}>{result.ai_score}/10</strong></div>
                  <div className="r-score"><span>Code Logic:</span> <strong style={{ color: '#3b82f6' }}>{result.coding_score}/10</strong></div>
                  <div className="r-score"><span>Comm Protocol:</span> <strong style={{ color: '#10b981' }}>{result.communication_score}/10</strong></div>
                </div>
              </motion.div>
            ) : (
              <div className="result-empty">
                <div className="empty-state-icon">
                  <LayoutDashboard size={40} strokeWidth={1.5} />
                </div>
                <h3>Awaiting Data</h3>
                <p>Complete the diagnostic module to view your personalized career recommendation.</p>
              </div>
            )}

            {/* Cross-Verification Search */}
            <div style={{ marginTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1.5rem" }}>
              <h4 style={{ color: "#f8fafc", marginBottom: "1rem" }}>Reverse Search: Career → Skills</h4>
              <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "1rem" }}>Cross-verify what skills are required for a specific role.</p>
              <div style={{ display: "flex", gap: "8px", marginBottom: "1rem" }}>
                <input 
                  type="text" 
                  placeholder="e.g. Data Scientist" 
                  style={{ flex: 1, padding: "8px 12px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.2)", color: "#fff", outline: "none" }}
                  value={searchCareer}
                  onChange={(e) => setSearchCareer(e.target.value)}
                />
                <button onClick={handleCareerSearch} className="btn-primary" style={{ padding: "8px 16px", minHeight: "auto" }}>Verify</button>
              </div>
              {careerSkills && (
                <div style={{ background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "8px" }}>
                  <strong style={{ color: "#a78bfa" }}>{careerSkills.career} Core Skills:</strong>
                  <ul style={{ margin: "8px 0 0", paddingLeft: "20px", color: "#cbd5e1", fontSize: "0.9rem" }}>
                    {careerSkills.skills.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}