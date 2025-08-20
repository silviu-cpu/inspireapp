// Student.js
import React, { useState } from "react";
import { loadAssignments, saveAssignments, STATUS } from "../../utils/storage";

export default function Student() {
  const [file, setFile] = useState(null);
  const [assignments, setAssignments] = useState(loadAssignments());

  const handleUpload = () => {
    if (!file) return;
    const newAssignment = {
      id: Date.now(),
      fileName: file.name,
      status: STATUS.SUBMITTED,
    };
    const updated = [...assignments, newAssignment];
    setAssignments(updated);
    saveAssignments(updated);
    setFile(null);
  };

  return (
    <div className="card">
      <div className="card-header">Student Dashboard</div>
      <div className="card-body">
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={handleUpload} className="btn btn-primary ml-2">
          Upload
        </button>
        <ul>
          {assignments.map((a) => (
            <li key={a.id}>
              {a.fileName} - <b>{a.status}</b>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
