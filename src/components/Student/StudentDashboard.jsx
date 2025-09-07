// src/components/Student/Student.jsx
import React, { useState, useEffect } from "react";
import {
  createAssignment,
  getAssignments,
  updateAssignment,
} from "../../utils/api";

export const STATUS = {
  SUBMITTED: "SUBMITTED",
  ACCEPTED: "ACCEPTED",
  REVISION_REQUIRED: "REVISION_REQUIRED",
};

export default function Student() {
  const [assignments, setAssignments] = useState([]);
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [newAssignment, setNewAssignment] = useState("");
  const [commentsInput, setCommentsInput] = useState({});
  const [editAssignments, setEditAssignments] = useState({});
  const [currentUser, setCurrentUser] = useState("");

  useEffect(() => {
    const userEmail = localStorage.getItem("currentUser");
    if (!userEmail) return;
    setCurrentUser(userEmail);

    const load = async () => {
      const all = await getAssignments();
      const userAssignments = all
        .filter((a) => a.uploadedBy === userEmail)
        .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
      setAssignments(userAssignments);
    };
    load();
  }, []);

  const handleCreateAssignment = async () => {
    if (!assignmentTitle.trim() || !newAssignment.trim()) {
      alert("Please enter both title and content.");
      return;
    }

    const assignment = {
      Name: Date.now().toString(),
      title: assignmentTitle.trim(),
      content: newAssignment.trim(),
      uploadedBy: currentUser,
      status: STATUS.SUBMITTED,
      comments: [],
      uploadedAt: new Date().toISOString(),
    };

    await createAssignment(assignment);

    const all = await getAssignments();
    setAssignments(
      all
        .filter((a) => a.uploadedBy === currentUser)
        .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
    );

    setAssignmentTitle("");
    setNewAssignment("");
  };

  const handleAddComment = async (assignment) => {
    const message = commentsInput[assignment.Name]?.trim();
    if (!message) return;

    const newComment = {
      id: Date.now(),
      user: currentUser,
      message,
      timestamp: new Date().toISOString(),
    };

    const updatedAssignment = {
      ...assignment,
      comments: [...(assignment.comments || []), newComment],
    };

    await updateAssignment(updatedAssignment);

    setAssignments((prev) =>
      prev.map((a) =>
        a.Name === assignment.Name ? { ...updatedAssignment } : a
      )
    );
    setCommentsInput((prev) => ({ ...prev, [assignment.Name]: "" }));
  };

  const handleUpdateAssignment = async (assignment) => {
    const updatedAssignment = {
      ...assignment,
      title: editAssignments[assignment.Name]?.title ?? assignment.title,
      content: editAssignments[assignment.Name]?.content ?? assignment.content,
      status: STATUS.SUBMITTED,
    };

    await updateAssignment(updatedAssignment);

    setAssignments((prev) =>
      prev
        .map((a) => (a.Name === assignment.Name ? updatedAssignment : a))
        .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
    );

    setEditAssignments((prev) => ({ ...prev, [assignment.Name]: {} }));
  };

  return (
    <div className="container mt-3">
      <h2 className="text-center mb-4">👩‍🎓 Student Dashboard</h2>

      {/* Creare temă nouă */}
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

          {/* Edit assignment dacă necesită revizie */}
          {a.status === STATUS.REVISION_REQUIRED && (
            <div className="mt-3">
              <h6>🔄 Revise Assignment</h6>
              <input
                className="form-control mb-2"
                value={editAssignments[a.Name]?.title ?? a.title}
                onChange={(e) =>
                  setEditAssignments((prev) => ({
                    ...prev,
                    [a.Name]: {
                      ...(prev[a.Name] || {}),
                      title: e.target.value,
                    },
                  }))
                }
              />
              <textarea
                className="form-control mb-2"
                rows="3"
                value={editAssignments[a.Name]?.content ?? a.content}
                onChange={(e) =>
                  setEditAssignments((prev) => ({
                    ...prev,
                    [a.Name]: {
                      ...(prev[a.Name] || {}),
                      content: e.target.value,
                    },
                  }))
                }
              />
              <button
                className="btn btn-warning"
                onClick={() => handleUpdateAssignment(a)}
              >
                Update Assignment
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
