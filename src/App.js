import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { fetchAuthSession, signOut } from "@aws-amplify/auth";
import Student from "./components/Student/StudentDashboard";
import Admin from "./components/Admin/AdminDashboard";
import Login from "./components/Login/Login";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      console.log("Checking existing auth session...");
      const session = await fetchAuthSession();

      if (session.tokens?.accessToken) {
        console.log("Found existing session");
        const idToken = session.tokens.idToken?.payload;
        const groups = idToken["cognito:groups"] || [];
        const role = groups.includes("teacher") ? "teacher" : "student";
        const username = idToken.email || idToken["cognito:username"];

        console.log("Restoring user session:", { username, role });
        setUser({ username, role });
      } else {
        console.log("No existing session found");
      }
    } catch (error) {
      console.log("No authenticated user:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = ({ username, role }) => {
    console.log("User logged in:", { username, role });
    setUser({ username, role });
  };

  const handleLogout = async () => {
    try {
      console.log("Logging out user...");
      await signOut();
      setUser(null);
      console.log("User logged out successfully");
    } catch (err) {
      console.error("Error signing out:", err);
      setUser(null);
    }
  };

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Login page */}
        <Route
          path="/login"
          element={
            !user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />
          }
        />

        {/* Main dashboard page */}
        <Route
          path="/"
          element={
            user ? (
              <DashboardWrapper user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
      </Routes>
    </Router>
  );
}

// Dashboard wrapper with sidebar
function DashboardWrapper({ user, onLogout }) {
  return (
    <div className="d-flex">
      <div
        className="sidebar bg-dark text-white p-3"
        style={{ width: "220px", minHeight: "100vh" }}
      >
        <h5 className="mb-4">Dashboard</h5>
        <div className="mb-3">
          <small className="text-muted">Logged in as:</small>
          <p className="mb-1">
            <strong>{user.username}</strong>
          </p>
          <span
            className={`badge ${
              user.role === "teacher" ? "bg-success" : "bg-primary"
            }`}
          >
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </span>
        </div>
        <button className="btn btn-secondary mt-auto" onClick={onLogout}>
          🚪 Logout
        </button>
      </div>

      <div className="flex-grow-1 p-4">
        {user.role === "teacher" && <Admin />}
        {user.role === "student" && <Student />}
      </div>
    </div>
  );
}
