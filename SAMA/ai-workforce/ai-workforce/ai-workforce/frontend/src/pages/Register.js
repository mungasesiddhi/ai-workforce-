import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Compass, User, Mail, Lock, ShieldCheck, ArrowRight, LogIn, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { API_URL } from "../config";
import "./Login.css"; // Reuse shared premium auth styles
import "./Register.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("register"); // 'register' | 'verify' | 'success'
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify them.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.ok) {
        setError(data?.error || "Registration failed. Try a different email.");
        return;
      }
      setStep("verify");
      setSuccessMsg("We've sent a 6-digit OTP to your email. Please enter it below to verify your account.");
    } catch (err) {
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.ok) {
        setError(data?.error || "Invalid OTP. Please try again.");
        return;
      }
      setStep("success");
      setSuccessMsg("Account verified successfully! You can now log in.");
    } catch (err) {
      setError("Unable to connect to the server.");
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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="auth-container"
      >
        {/* Left Brand Panel */}
        <div className="auth-details">
          <div className="auth-logo">
            <div className="icon-box">
              <Compass size={28} color="#fff" />
            </div>
            <span>CareerNav AI</span>
          </div>

          <h2>Join the future of career finding</h2>
          <p>Create an account to access deep analytical career matching and tailored educational roadmaps mapped exactly to your current skill profile.</p>

          <div className="auth-features">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="auth-feature">
              <div className="feature-icon"><CheckCircle2 size={16} /></div>
              <span>Access AI Career Simulator</span>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="auth-feature">
              <div className="feature-icon"><CheckCircle2 size={16} /></div>
              <span>Personalized Role Matching</span>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="auth-feature">
              <div className="feature-icon"><CheckCircle2 size={16} /></div>
              <span>Save & track your progress</span>
            </motion.div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="auth-form-wrapper">
          {step === "success" ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center", padding: "2rem" }}>
              <div className="success-icon-container">
                <CheckCircle2 size={64} className="success-pulse-icon" />
              </div>
              <h3 style={{ marginBottom: "1rem", color: "var(--text-bright)", fontSize: "1.75rem" }}>Registration Successful!</h3>
              <p style={{ marginBottom: "2rem", color: "var(--text-muted)", lineHeight: "1.6" }}>{successMsg}</p>
              <button type="button" className="btn-primary" onClick={() => navigate("/")} style={{ width: "100%" }}>
                <LogIn size={18} style={{ marginRight: "8px" }} />
                Sign In Now
              </button>
            </motion.div>
          ) : step === "verify" ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="otp-container">
              <div className="auth-form-header">
                <h3>Verify Email</h3>
                <p>{successMsg}</p>
              </div>

              <form className="auth-form" onSubmit={handleVerify}>
                <div className="form-group">
                  <label>Verification Code (OTP)</label>
                  <div className="input-container otp-input-wrapper">
                    <ShieldCheck size={20} className="input-icon" />
                    <input
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\\D/g, "").slice(0, 6))}
                      className="otp-field"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="form-error">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                  </motion.div>
                )}

                <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: "1.5rem" }}>
                  {loading ? "Verifying..." : "Verify Account"}
                  {!loading && <ArrowRight size={18} />}
                </button>
              </form>

              <div className="auth-footer" style={{ marginTop: "2rem" }}>
                Didn't get the code?
                <button onClick={() => setStep("register")} style={{ color: "var(--primary)" }}> Try Again</button>
              </div>
            </motion.div>
          ) : (
            <>
              <div className="auth-form-header">
                <h3>Create Account</h3>
                <p>Setup your profile to begin</p>
              </div>

              <form className="auth-form" onSubmit={handleRegister}>
                <div className="form-group">
                  <label>Full Legal Name</label>
                  <div className="input-container">
                    <User size={18} className="input-icon" />
                    <input
                      type="text"
                      placeholder="e.g. Alex Sterling"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Work Email</label>
                  <div className="input-container">
                    <Mail size={18} className="input-icon" />
                    <input
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Create Password</label>
                    <div className="input-container">
                      <Lock size={18} className="input-icon" />
                      <input
                        type="password"
                        placeholder="Min 8 chars"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Verify Password</label>
                    <div className="input-container">
                      <ShieldCheck size={18} className="input-icon" />
                      <input
                        type="password"
                        placeholder="Re-enter"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="form-error">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                  </motion.div>
                )}

                <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: "1rem" }}>
                  {loading ? "Initializing..." : "Complete Setup"}
                  {!loading && <ArrowRight size={18} />}
                </button>
              </form>

              <div className="auth-footer">
                Already registered?
                <button onClick={() => navigate("/")}>
                  <LogIn size={16} />
                  Sign In
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}