import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Student from "./components/Student/StudentDashboard";
import Admin from "./components/Admin/AdminDashboard";

export default function App() {
  return (
    <Router>
      <nav className="p-4 bg-gray-200 flex space-x-4">
        <Link to="/student" className="text-blue-600">
          Student
        </Link>
        <Link to="/admin" className="text-blue-600">
          Admin
        </Link>
      </nav>
      <Routes>
        <Route path="/student" element={<Student />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}
