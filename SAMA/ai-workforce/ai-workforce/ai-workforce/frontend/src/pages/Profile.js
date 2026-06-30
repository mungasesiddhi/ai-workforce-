import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { UserCircle, GraduationCap, Code2, MessageSquare, Briefcase, ArrowRight, UploadCloud, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { API_URL } from "../config";
import "./Profile.css";

const fields = [
  { key: "name", label: "Full Name", placeholder: "e.g. Alex Sterling", icon: UserCircle },
  { key: "education", label: "Education Level", placeholder: "e.g. Computer Science MS", icon: GraduationCap },
  { key: "skill", label: "Core Competency", placeholder: "e.g. Deep Learning", icon: Briefcase },
  { key: "language", label: "Primary Language", placeholder: "e.g. Python, Rust", icon: Code2 },
  { key: "communication", label: "Communication Skill", placeholder: "e.g. Advanced", icon: MessageSquare },
];

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [values, setValues] = useState({
      name: localStorage.getItem("user_name") || ""
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleChange = (key, val) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("career_token");
    if (!token) {
       setUploading(false);
       setUploadError("Security Identity expired. Please Logout and Log back in to upload files.");
       return;
    }

    try {
      const res = await fetch(`${API_URL}/upload_resume`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.extracted_scores) {
        navigate("/assessment", { state: { prefill: data.extracted_scores } });
      } else {
        if (res.status === 401) {
            setUploadError("Session expired. Please click 'Logout' in the top right, then log back in.");
        } else {
            setUploadError(data.error || "Failed to parse PDF document.");
        }
      }
    } catch (err) {
       console.error(err);
       setUploadError("Network Error: Ensure the Flask backend is currently running.");
    } finally {
       setUploading(false);
       // Clear the input so they can try again with the same file if wanted
       if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="profile-page"
    >
      <div className="page-header">
        <div className="page-header-icon">
          <UserCircle size={24} strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-gradient">Profile Configuration</h1>
          <p>Tell us about your background or upload a resume to auto-calibrate your vectors.</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "2rem", flexDirection: "column" }}>
        {/* Magic Resume Card */}
        <div className="glass-panel" style={{ padding: "2rem", textAlign: "center", border: "1px dashed rgba(168, 85, 247, 0.4)" }}>
          <div style={{ width: "56px", height: "56px", margin: "0 auto 1rem", borderRadius: "50%", background: "rgba(168, 85, 247, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#c084fc" }}>
            <FileText size={28} />
          </div>
          <h3 style={{ marginBottom: "0.5rem" }}>Auto-Configure via Resume (NLP)</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
            Our neural parser will analyze your PDF resume to instantly extract exact AI, Coding, and Synergic benchmarks.
          </p>
          <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleUpload} style={{ display: "none" }} />
          <button className="btn-primary" onClick={() => fileInputRef.current.click()} disabled={uploading}>
             {uploading ? "Analyzing Document..." : "Upload Resume (PDF)"}
             {!uploading && <UploadCloud size={18} />}
          </button>
          {uploadError && (
             <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} style={{ marginTop: "1rem", color: "#fca5a5", fontSize: "0.85rem", background: "rgba(239, 68, 68, 0.1)", padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
               {uploadError}
             </motion.div>
          )}
        </div>

        {/* Manual Card */}
        <div className="profile-card glass-panel" style={{ opacity: uploading ? 0.5 : 1, pointerEvents: uploading ? "none" : "auto" }}>
          <div className="profile-fields">
            {fields.map(({ key, label, placeholder, icon: Icon }) => (
              <div className="profile-field" key={key}>
                <label>{label}</label>
                <div className="input-wrapper">
                  <Icon size={18} className="input-icon" />
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={values[key] || ""}
                    onChange={(e) => handleChange(key, e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="profile-footer">
            <button className="btn-primary" onClick={() => navigate("/assessment")}>
              Initialize Assessment Manually
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}