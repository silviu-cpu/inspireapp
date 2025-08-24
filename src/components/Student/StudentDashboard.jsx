import React, { useState, useEffect } from "react";
import {
  loadAssignments,
  addAssignment,
  addComment,
  updateAssignment,
  STATUS,
} from "../../utils/storage";

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

    const userAssignments = loadAssignments().filter(
      (a) => a.uploadedBy === userEmail
    );
    setAssignments(userAssignments);
  }, []);

  const handleCreateAssignment = () => {
    if (!assignmentTitle.trim() || !newAssignment.trim()) {
      alert("Please enter both title and content.");
      return;
    }

    const assignment = {
      id: Date.now(),
      title: assignmentTitle.trim(),
      content: newAssignment.trim(),
      uploadedBy: currentUser,
      status: STATUS.SUBMITTED,
      comments: [],
      uploadedAt: new Date().toISOString(),
    };

    addAssignment(assignment);

    const updatedAssignments = loadAssignments().filter(
      (a) => a.uploadedBy === currentUser
    );
    setAssignments(updatedAssignments);

    setAssignmentTitle("");
    setNewAssignment("");
  };

  const handleAddComment = (assignmentId) => {
    const message = commentsInput[assignmentId]?.trim();
    if (!message) return;

    const comment = {
      id: Date.now(),
      user: currentUser,
      message,
      timestamp: new Date().toISOString(),
    };

    addComment(assignmentId, comment);

    const updatedAssignments = loadAssignments().filter(
      (a) => a.uploadedBy === currentUser
    );
    setAssignments(updatedAssignments);

    setCommentsInput((prev) => ({ ...prev, [assignmentId]: "" }));
  };

  const handleUpdateAssignment = (
    assignmentId,
    updatedContent,
    updatedTitle
  ) => {
    if (!updatedTitle.trim() || !updatedContent.trim()) {
      alert("Please fill both title and content.");
      return;
    }

    updateAssignment(assignmentId, {
      title: updatedTitle.trim(),
      content: updatedContent.trim(),
      status: STATUS.SUBMITTED, // resetează status după edit
    });

    const updatedAssignments = loadAssignments().filter(
      (a) => a.uploadedBy === currentUser
    );
    setAssignments(updatedAssignments);
  };

  return (
    <div className="container mt-3">
      <h2 className="text-center mb-4">👩‍🎓 Student Dashboard</h2>

      {/* Creare o tema noua */}
      {assignments.every((a) => a.status === STATUS.ACCEPTED) && (
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
            <button
              className="btn btn-primary"
              onClick={handleCreateAssignment}
            >
              Submit Assignment
            </button>
          </div>
        </div>
      )}

      {/* Listeaza temele */}
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
            <b>Uploaded by:</b> {a.uploadedBy}
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

            {/* Input comentariu */}
            {a.status !== STATUS.ACCEPTED && (
              <>
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
              </>
            )}
          </div>

          {/* Edit tema daca necesita revizie */}
          {a.status === STATUS.REVISION_REQUIRED && (
            <div className="mt-2">
              <input
                className="form-control mb-1"
                value={a.title}
                onChange={(e) => {
                  const updatedTitle = e.target.value;
                  setAssignments((prev) =>
                    prev.map((item) =>
                      item.id === a.id ? { ...item, title: updatedTitle } : item
                    )
                  );
                }}
                placeholder="Title"
              />
              <textarea
                className="form-control mb-1"
                rows="3"
                value={a.content}
                onChange={(e) => {
                  const updatedContent = e.target.value;
                  setAssignments((prev) =>
                    prev.map((item) =>
                      item.id === a.id
                        ? { ...item, content: updatedContent }
                        : item
                    )
                  );
                }}
                placeholder="Content"
              />
              <button
                className="btn btn-sm btn-warning"
                onClick={() => handleUpdateAssignment(a.id, a.content, a.title)}
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
