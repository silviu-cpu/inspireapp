// src/components/Admin/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  getAssignments,
  addCommentApi,
  updateAssignment,
} from "../../utils/api";

export const STATUS = {
  SUBMITTED: "SUBMITTED",
  ACCEPTED: "ACCEPTED",
  REVISION_REQUIRED: "REVISION_REQUIRED",
};

export default function Admin() {
  const [assignments, setAssignments] = useState([]);
  const [commentsInput, setCommentsInput] = useState({});

  // încarcă toate assignments din API
  useEffect(() => {
    const load = async () => {
      try {
        const all = await getAssignments();
        setAssignments(all);
      } catch (err) {
        console.error("Failed to fetch assignments:", err);
      }
    };
    load();
  }, []);

  // adaugă un comentariu și face update în DB
  const handleAddComment = async (assignment) => {
    const message = commentsInput[assignment.Name]?.trim();
    if (!message) return;

    try {
      await addCommentApi(assignment.Name, "Admin", message);
      const all = await getAssignments(); // reîncarcă assignments
      setAssignments(all);
      setCommentsInput((prev) => ({ ...prev, [assignment.Name]: "" }));
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  // update status assignment
  const updateStatus = async (assignment, status) => {
    const updatedAssignment = { ...assignment, status };

    try {
      await updateAssignment(updatedAssignment);
      const all = await getAssignments();
      setAssignments(all);
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const pendingAssignments = assignments.filter(
    (a) => a.status !== STATUS.ACCEPTED
  );

  return (
    <div className="container mt-3">
      <h2 className="text-center mb-4">👨‍🏫 Admin Dashboard</h2>

      {pendingAssignments.length === 0 ? (
        <div className="alert alert-success text-center">
          🎉 All assignments have been accepted! Nothing pending.
        </div>
      ) : (
        pendingAssignments.map((a) => (
          <div key={a.Name} className="card mb-3 p-3 border-primary">
            <span
              className={`badge bg-${
                a.status === STATUS.ACCEPTED
                  ? "success"
                  : a.status === STATUS.REVISION_REQUIRED
                  ? "danger"
                  : "warning"
              }`}
            >
              {a.status}
            </span>
            <h5>{a.title}</h5>

            <p>{a.content}</p>
            <p>
              <b>Uploaded by:</b> {a.uploadedBy || "Unknown student"}
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

            <div className="mt-2">
              <button
                className="btn btn-sm btn-success me-2"
                onClick={() => updateStatus(a, STATUS.ACCEPTED)}
              >
                ✅ Accept
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => updateStatus(a, STATUS.REVISION_REQUIRED)}
              >
                🔄 Revision
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
