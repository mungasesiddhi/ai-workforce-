import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Compass, Mail, Lock, ArrowRight, UserPlus, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { API_URL } from "../config";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.ok) {
        setError(data?.error || "Login failed. Please check your credentials.");
        return;
      }
      
      // ENTERPRISE FEATURE: Save JWT token to authorize secure API calls
      localStorage.setItem("career_token", data.token);
      localStorage.setItem("user_name", data.user.name);

      navigate("/profile");
    } catch (err) {
      setError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Floating Animated Background Shapes */}
      <div className="auth-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="auth-container"
      >
        {/* Left Side: Brand & Benefits */}
        <div className="auth-details">
          <div className="auth-logo">
            <div className="icon-box">
              <Compass size={28} color="#fff" />
            </div>
            <span>CareerNav AI</span>
          </div>

          <h2>Unlock your ultimate career potential</h2>
          <p>
            Experience the next generation of career guidance. Our advanced neural network evaluates your unique skill profile to precisely match you with the future of work.
          </p>

          <div className="auth-features">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="auth-feature">
              <div className="feature-icon"><CheckCircle2 size={16} /></div>
              <span>Data-driven career predictions</span>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="auth-feature">
              <div className="feature-icon"><CheckCircle2 size={16} /></div>
              <span>Real-time capability mapping</span>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="auth-feature">
              <div className="feature-icon"><CheckCircle2 size={16} /></div>
              <span>50+ emerging technology roles</span>
            </motion.div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="auth-form-wrapper">
          <div className="auth-form-header">
            <h3>Welcome back</h3>
            <p>Access your personalized dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label>Email ID</label>
              <div className="input-container">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Secure Password</label>
              <div className="input-container">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="form-error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </motion.div>
            )}

            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: "1rem" }}>
              {loading ? "Authenticating..." : "Sign in to Dashboard"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="auth-footer">
            New to CareerNav? 
            <button onClick={() => navigate("/register")}>
              <UserPlus size={16} />
              Create account
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
