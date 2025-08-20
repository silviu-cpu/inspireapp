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
    <div className="p-4">
      <h2>Admin Dashboard</h2>
      <ul>
        {assignments.map((a) => (
          <li key={a.id}>
            {a.fileName} - <b>{a.status}</b>
            <button onClick={() => updateStatus(a.id, STATUS.ACCEPTED)}>
              Accept
            </button>
            <button
              onClick={() => updateStatus(a.id, STATUS.REVISION_REQUIRED)}
            >
              Refacere
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
