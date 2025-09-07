// src/components/Student/StudentDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  createAssignment,
  getAssignments,
  addCommentApi,
} from "../../utils/api";

export default function Student() {
  const [assignments, setAssignments] = useState([]);
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [newAssignment, setNewAssignment] = useState("");
  const [commentsInput, setCommentsInput] = useState({});
  const [currentUser, setCurrentUser] = useState("");

  useEffect(() => {
    const userEmail = localStorage.getItem("currentUser");
    if (!userEmail) return;
    setCurrentUser(userEmail);

    // ia doar temele user-ului logat
    const load = async () => {
      try {
        const all = await getAssignments();
        setAssignments(all.filter((a) => a.uploadedBy === userEmail));
      } catch (err) {
        console.error("Failed to load assignments:", err);
      }
    };
    load();
  }, []);

  const handleCreateAssignment = async () => {
    if (!assignmentTitle.trim() || !newAssignment.trim()) {
      alert("Please enter both title and content.");
      return;
    }

    const assignment = {
      Name: Date.now().toString(), // DynamoDB PK
      title: assignmentTitle.trim(),
      content: newAssignment.trim(),
      uploadedBy: currentUser,
      status: "SUBMITTED",
      comments: [],
      uploadedAt: new Date().toISOString(),
    };

    try {
      await createAssignment(assignment);
      const all = await getAssignments();
      setAssignments(all.filter((a) => a.uploadedBy === currentUser));
      setAssignmentTitle("");
      setNewAssignment("");
    } catch (err) {
      console.error("Failed to create assignment:", err);
    }
  };

  const handleAddComment = async (assignment) => {
    const message = commentsInput[assignment.Name]?.trim();
    if (!message) return;

    try {
      await addCommentApi(assignment.Name, currentUser, message);
      const all = await getAssignments();
      setAssignments(all.filter((a) => a.uploadedBy === currentUser));
      setCommentsInput((prev) => ({ ...prev, [assignment.Name]: "" }));
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  return (
    <div className="container mt-3">
      <h2 className="text-center mb-4">👩‍🎓 Student Dashboard</h2>

      {/* Creare o temă nouă */}
      <div className="card mb-4 p-3 border-primary">
        <h5>📝 Submit New Assignment</h5>
        <div className="mb-2">
          <input
            className="form-control mb-2"
            placeholder="Title"
            value={assignmentTitle}
            onChange={(e) => setAssignmentTitle(e.target.value)}
          />
          <textarea
            className="form-control mb-2"
            rows="4"
            placeholder="Content"
            value={newAssignment}
            onChange={(e) => setNewAssignment(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleCreateAssignment}>
            Submit Assignment
          </button>
        </div>
      </div>

      {/* Listează temele */}
      {assignments.map((a) => (
        <div key={a.Name} className="card mb-3 p-3 border-primary">
          <h5>{a.title}</h5>
          <span
            className={`badge bg-${
              a.status === "ACCEPTED"
                ? "success"
                : a.status === "REVISION_REQUIRED"
                ? "danger"
                : "warning"
            }`}
          >
            {a.status}
          </span>
          <p>{a.content}</p>
          <p>
            <b>Uploaded by:</b> {a.uploadedBy}
          </p>

          {/* Conversație */}
          <div className="mt-2">
            <strong>Conversation:</strong>
            <div
              className="bg-light p-2 rounded"
              style={{ maxHeight: "150px", overflowY: "auto" }}
            >
              {a.comments?.map((c) => (
                <div key={c.id}>
                  <b>{c.user}:</b> {c.message}{" "}
                  <small>{new Date(c.timestamp).toLocaleTimeString()}</small>
                </div>
              ))}
            </div>

            <input
              className="form-control mt-2"
              placeholder="Type your comment..."
              value={commentsInput[a.Name] || ""}
              onChange={(e) =>
                setCommentsInput((prev) => ({
                  ...prev,
                  [a.Name]: e.target.value,
                }))
              }
            />
            <button
              className="btn btn-sm btn-primary mt-1"
              onClick={() => handleAddComment(a)}
            >
              Send
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
