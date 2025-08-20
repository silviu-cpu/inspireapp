// Admin.js
import React, { useState } from "react";
import { loadAssignments, saveAssignments, STATUS } from "../../utils/storage";

export default function Admin() {
  const [assignments, setAssignments] = useState(loadAssignments());

  const updateStatus = (id, status) => {
    const updated = assignments.map((a) =>
      a.id === id ? { ...a, status } : a
    );
    setAssignments(updated);
    saveAssignments(updated);
  };

  return (
    <div className="card">
      <div className="card-header">Admin Dashboard</div>
      <div className="card-body">
        <ul>
          {assignments.map((a) => (
            <li key={a.id}>
              {a.fileName} - <b>{a.status}</b>
              <button
                onClick={() => updateStatus(a.id, STATUS.ACCEPTED)}
                className="btn btn-primary ml-2"
              >
                Accept
              </button>
              <button
                onClick={() => updateStatus(a.id, STATUS.REVISION_REQUIRED)}
                className="btn btn-danger ml-2"
              >
                Refacere
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
