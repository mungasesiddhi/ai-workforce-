import { useLocation, useNavigate } from "react-router-dom";
import { Target, Sparkles, BrainCircuit, Code2, MessageSquare, RotateCcw, LayoutDashboard, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import "./ScoreCard.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ScoreCard() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state || {};

  const chartData = {
    labels: ['AI Ethics Specialist', 'Data Scientist', 'Cybersecurity Analyst', data.career || 'Predicted Career', 'Accountant', 'Data Entry Operator'],
    datasets: [
      {
        label: 'Future-Proof Score',
        data: [92, 88, 90, 95, 60, 25],
        backgroundColor: [
          'rgba(59, 130, 246, 0.6)',
          'rgba(59, 130, 246, 0.6)',
          'rgba(59, 130, 246, 0.6)',
          'rgba(167, 139, 250, 0.9)', 
          'rgba(248, 113, 113, 0.6)',
          'rgba(248, 113, 113, 0.6)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(167, 139, 250, 1)',
          'rgba(248, 113, 113, 1)',
          'rgba(248, 113, 113, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      x: { 
        title: { display: true, text: 'Career Name', color: '#f8fafc' },
        ticks: { color: '#cbd5e1' }
      },
      y: { 
        title: { display: true, text: 'Future-Proof Score (0-100)', color: '#f8fafc' },
        min: 0, max: 100,
        ticks: { color: '#cbd5e1' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      }
    },
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Career vs Future-Proof Score', color: '#f8fafc', font: { size: 16 } }
    },
    maintainAspectRatio: false,
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="score-page"
    >
      <div className="score-header">
        <div className="score-header-icon">
          <Target size={32} strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-gradient">Optimal Career Match Identified</h1>
          <p>The neural network has processed your skill distribution matrix.</p>
        </div>
      </div>

      <div className="score-card-main glass-panel">
        <div className="result-banner">
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
            className="sparkle-icon"
          >
            <Sparkles size={28} color="#fcd34d" fill="#fef3c7" />
          </motion.div>
          <h2 className="text-gradient">{data.career || "Unknown Sector"}</h2>
          <span className="match-badge">99.8% Match Confidence</span>
        </div>

        <div className="score-metrics-wrapper">
          <h3 className="section-title">Future-Proof Market Viability</h3>
          <div style={{ height: "300px", marginBottom: "2rem" }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
          <div className="score-metrics-grid">
            <motion.div whileHover={{ y: -5 }} className="metric-box">
              <div className="metric-icon blue"><BrainCircuit size={22} /></div>
              <div className="metric-details">
                <span className="metric-label">AI Logic Core</span>
                <span className="metric-value">{data.ai_score || 0}<span>.0</span></span>
              </div>
            </motion.div>
            
            <motion.div whileHover={{ y: -5 }} className="metric-box">
              <div className="metric-icon purple"><Code2 size={22} /></div>
              <div className="metric-details">
                <span className="metric-label">Software Architecture</span>
                <span className="metric-value">{data.coding_score || 0}<span>.0</span></span>
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="metric-box">
              <div className="metric-icon emerald"><MessageSquare size={22} /></div>
              <div className="metric-details">
                <span className="metric-label">Cross-Comm Protocol</span>
                <span className="metric-value">{data.communication_score || 0}<span>.0</span></span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* --- ML EXPLAINABILITY --- */}
        {data.explainability && (
          <div className="score-metrics-wrapper" style={{ marginBottom: "2.5rem" }}>
            <h3 className="section-title">Machine Learning Explainability (SHAP Proxy)</h3>
            <div className="metric-box" style={{ background: "rgba(139, 92, 246, 0.1)", textAlign: "left", alignItems: "flex-start", padding: "1rem" }}>
              <p style={{ color: "#c4b5fd", fontSize: "0.95rem", lineHeight: "1.6" }}>{data.explainability}</p>
            </div>
          </div>
        )}

        {/* --- AI ROADMAP --- */}
        {data.roadmap && (
          <div className="score-metrics-wrapper" style={{ marginBottom: "3rem" }}>
            <h3 className="section-title">Generated 4-Month Acceleration Roadmap</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {data.roadmap.map((step, idx) => (
                <div key={idx} style={{ background: "rgba(0,0,0,0.3)", padding: "12px 16px", borderRadius: "8px", borderLeft: "3px solid #f472b6" }}>
                  <span style={{ color: "#f8fafc", fontSize: "0.9rem", fontWeight: "500" }}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="score-actions">
          <button className="btn-primary" onClick={() => navigate("/assessment")}>
            <RotateCcw size={18} />
            Re-run Calibration
          </button>
          <button className="btn-secondary" onClick={() => navigate("/dashboard")}>
            <LayoutDashboard size={18} />
            Diagnostic Mode
          </button>
          <button className="btn-outline" onClick={() => {
            localStorage.removeItem("career_token");
            navigate("/");
          }}>
            <LogOut size={18} />
            Terminate Session
          </button>
        </div>
      </div>
    </motion.div>
  );
}