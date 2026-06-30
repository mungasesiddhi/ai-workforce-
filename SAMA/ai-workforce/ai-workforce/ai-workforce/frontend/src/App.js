import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "./App.css";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Assessment from "./pages/Assessment";
import ScoreCard from "./pages/ScoreCard";
import Dashboard from "./pages/Dashboard";
import HistoryTracker from "./pages/History";
import Navbar from "./components/Navbar";
import Chatbot from "./components/Chatbot";

function AppContent() {
  const location = useLocation();
  const noNavRoutes = ["/", "/register"];
  const showNav = !noNavRoutes.includes(location.pathname);

  return (
    <>
      {showNav && <Navbar />}
      <div className={showNav ? "app-layout" : ""}>
        <div className={showNav ? "app-content" : ""}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/score" element={<ScoreCard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/history" element={<HistoryTracker />} />
          </Routes>
        </div>
      </div>
      {showNav && <Chatbot />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;