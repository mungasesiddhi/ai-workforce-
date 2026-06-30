import React, { useState, useEffect } from "react";
import { Activity, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { API_URL } from "../config";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function HistoryTracker() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("career_token");
      const res = await fetch(`${API_URL}/history`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data.reverse()); // Chronological for graph
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: history.map((_, i) => `Run ${i + 1}`),
    datasets: [
      {
        label: 'AI Vector',
        data: history.map(h => h.ai_score),
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Coding Logic',
        data: history.map(h => h.coding_score),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Comm Protocol',
        data: history.map(h => h.communication_score),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#94a3b8', font: { family: 'Outfit' } } }
    },
    scales: {
      y: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#94a3b8' },
        min: 0,
        max: 10
      },
      x: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#94a3b8' }
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="history-page" style={{ maxWidth: '1000px', margin: '0 auto', paddingTop: '2rem' }}>
      <div className="page-header" style={{ marginBottom: "2rem" }}>
        <div className="page-header-icon" style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Activity size={26} color="#a855f7" />
        </div>
        <div>
          <h1 className="text-gradient">Historical Performance Telemetry</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Track your shifting capability matrix across sequential calibration runs.</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        {loading ? (
          <p style={{ color: '#94a3b8', textAlign: 'center' }}>Loading historical data...</p>
        ) : history.length > 0 ? (
          <div style={{ height: '400px' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8' }}>
            <Clock size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
            <p>No telemetry found. Provide a diagnostic run to establish baseline vectors.</p>
          </div>
        )}
      </div>
      
      {/* List view */}
      {history.length > 0 && (
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {[...history].reverse().map((run) => (
             <motion.div key={run.id} whileHover={{ y:-3, borderColor: '#a78bfa' }} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem', borderRadius: '12px', transition: 'all 0.3s' }}>
                <span style={{ fontSize: '0.75rem', color: '#a78bfa', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                   {new Date(run.date).toLocaleDateString()}
                </span>
                <h3 style={{ margin: '8px 0', fontSize: '1.25rem', color: '#fff' }}>{run.career}</h3>
                <div style={{ display: 'flex', gap: '15px', color: '#94a3b8', fontSize: '0.85rem' }}>
                  <span>AI: {run.ai_score}</span>
                  <span>Code: {run.coding_score}</span>
                  <span>Comm: {run.communication_score}</span>
                </div>
             </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
