import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Compass, BarChart3, User, ClipboardList, LogOut, Activity } from "lucide-react";
import "./Navbar.css";

const navItems = [
  { path: "/profile",    label: "Profile",    icon: User },
  { path: "/assessment", label: "Assessment", icon: ClipboardList },
  { path: "/dashboard",  label: "Dashboard",  icon: BarChart3 },
  { path: "/history",    label: "History",    icon: Activity },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="navbar-brand" onClick={() => navigate("/profile")}>
          <div className="navbar-logo">
            <Compass size={22} strokeWidth={2.2} />
          </div>
          <span className="navbar-title">AI Career Navigator</span>
        </div>

        {/* Links */}
        <ul className="navbar-links">
          {navItems.map(({ path, label, icon: Icon }) => (
            <li key={path}>
              <button
                className={`nav-link ${location.pathname === path ? "active" : ""}`}
                onClick={() => navigate(path)}
              >
                <Icon size={17} strokeWidth={2} />
                <span>{label}</span>
              </button>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="navbar-actions">
          <button className="nav-logout" onClick={() => navigate("/")}>
            <LogOut size={17} strokeWidth={2} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
