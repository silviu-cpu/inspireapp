import React, { useState, useEffect } from "react";
import {
  loadAssignments,
  addComment,
  updateAssignment,
  STATUS,
} from "../../utils/storage";

export default function Admin() {
  const [assignments, setAssignments] = useState([]);
  const [commentsInput, setCommentsInput] = useState({});

  useEffect(() => {
    setAssignments(loadAssignments());
  }, []);

  const handleAddComment = (assignmentId) => {
    const message = commentsInput[assignmentId]?.trim();
    if (!message) return;

    const comment = {
      id: Date.now(),
      user: "Admin",
      message,
      timestamp: new Date().toISOString(),
    };
    const updated = addComment(assignmentId, comment);
    setAssignments(updated);
    setCommentsInput((prev) => ({ ...prev, [assignmentId]: "" }));
  };

  const updateStatus = (assignmentId, status) => {
    const updated = updateAssignment(assignmentId, { status });
    setAssignments(updated);
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
          <div key={a.id} className="card mb-3 p-3 border-primary">
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

            {/* Conversatie */}
            <div className="mt-2">
              <strong>Conversation:</strong>
              <div
                className="bg-light p-2 rounded"
                style={{ maxHeight: "150px", overflowY: "auto" }}
              >
                {a.comments.map((c) => (
                  <div key={c.id}>
                    <b>{c.user}:</b> {c.message}{" "}
                    <small>{new Date(c.timestamp).toLocaleTimeString()}</small>
                  </div>
                ))}
              </div>

              <input
                className="form-control mt-2"
                placeholder="Type your comment..."
                value={commentsInput[a.id] || ""}
                onChange={(e) =>
                  setCommentsInput((prev) => ({
                    ...prev,
                    [a.id]: e.target.value,
                  }))
                }
              />
              <button
                className="btn btn-sm btn-primary mt-1"
                onClick={() => handleAddComment(a.id)}
              >
                Send
              </button>
            </div>

            <div className="mt-2">
              <button
                className="btn btn-sm btn-success me-2"
                onClick={() => updateStatus(a.id, STATUS.ACCEPTED)}
              >
                ✅ Accept
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => updateStatus(a.id, STATUS.REVISION_REQUIRED)}
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
