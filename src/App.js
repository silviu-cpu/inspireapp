import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Student from "./components/Student/StudentDashboard";
import Admin from "./components/Admin/AdminDashboard";
import Login from "./components/Login/Login";
import { signOut } from "@aws-amplify/auth";

export default function App() {
  const [user, setUser] = useState(null);

  const handleLogin = ({ username, role }) => {
    setUser({ username, role });
  };

  const handleLogout = async () => {
    try {
      console.log("Attempting to sign out...");
      await signOut();
      console.log("Successfully signed out from AWS Cognito");
      setUser(null);
    } catch (err) {
      console.error("Error signing out:", err);
      // Even if signOut fails, clear the local state
      setUser(null);
    }
  };

  // Dacă nu există user logat, afișăm **doar pagina de login**
  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  // Dacă user există, afișăm dashboard + sidebar
  return (
    <div className="d-flex">
      <div
        className="sidebar bg-dark text-white p-3"
        style={{ width: "220px", minHeight: "100vh" }}
      >
        <h5 className="mb-4">Dashboard</h5>
        <p>
          Logged in as: <b>{user.username}</b>
        </p>
        <button className="btn btn-secondary mt-2" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="flex-grow-1 p-4">
        {user.role === "admin" && <Admin />}
        {user.role === "student" && <Student />}
      </div>
    </div>
  );
}
