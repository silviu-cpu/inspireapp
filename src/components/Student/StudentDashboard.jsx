import React, { useState, useEffect } from "react";
import { createAssignment, getAssignments } from "../../utils/api";

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
      const all = await getAssignments();
      setAssignments(all.filter((a) => a.uploadedBy === userEmail));
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

    await createAssignment(assignment);

    // reîncarcă temele după submit
    const all = await getAssignments();
    setAssignments(all.filter((a) => a.uploadedBy === currentUser));

    setAssignmentTitle("");
    setNewAssignment("");
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
          </div>
        </div>
      ))}
    </div>
  );
}
