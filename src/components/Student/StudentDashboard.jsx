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
    <div className="p-4">
      <h2>Student Dashboard</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>
      <ul>
        {assignments.map((a) => (
          <li key={a.id}>
            {a.fileName} - <b>{a.status}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}
