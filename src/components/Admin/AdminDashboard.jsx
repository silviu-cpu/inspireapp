import React, { useState, useEffect } from "react";
import {
  loadAssignments,
  addComment,
  updateAssignment,
  STATUS,
} from "../../utils/storage";

export default function Admin() {
  const [assignments, setAssignments] = useState([]);
  const [commentsInput, setCommentsInput] = useState({}); // 👈 obiect cu input pe assignmentId

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
    setCommentsInput((prev) => ({ ...prev, [assignmentId]: "" })); // curăț input-ul pentru tema respectivă
  };

  const updateStatus = (assignmentId, status) => {
    const updated = updateAssignment(assignmentId, { status });
    setAssignments(updated);
  };

  return (
    <div className="container mt-3">
      <h2 className="text-center mb-4">👨‍🏫 Admin Dashboard</h2>
      {assignments.map((a) => (
        <div key={a.id} className="card mb-3 p-3 border-primary">
          <h5>{a.title}</h5>
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
          <p>{a.content}</p>
          <p>
            <b>Uploaded by:</b> {a.uploadedBy || "Unknown student"}
          </p>

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

            {a.status !== STATUS.ACCEPTED && (
              <>
                <input
                  className="form-control mt-2"
                  placeholder="Type your comment..."
                  value={commentsInput[a.id] || ""} // 👈 valoare per temă
                  onChange={(e) =>
                    setCommentsInput((prev) => ({
                      ...prev,
                      [a.id]: e.target.value,
                    }))
                  } // 👈 schimbare per temă
                />
                <button
                  className="btn btn-sm btn-primary mt-1"
                  onClick={() => handleAddComment(a.id)}
                >
                  Send
                </button>
              </>
            )}
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
      ))}
    </div>
  );
}
