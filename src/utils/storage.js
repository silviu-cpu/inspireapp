export const STATUS = {
  SUBMITTED: "SUBMITTED",
  ACCEPTED: "ACCEPTED",
  REVISION_REQUIRED: "REVISION_REQUIRED",
};

export const loadAssignments = () => {
  try {
    const stored = localStorage.getItem("assignments");
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error("Error loading assignments:", error);
    return [];
  }
};

export const saveAssignments = (assignments) => {
  try {
    localStorage.setItem("assignments", JSON.stringify(assignments));
  } catch (error) {
    console.error("Error saving assignments:", error);
  }
};

export const addAssignment = (assignment) => {
  const assignments = loadAssignments();
  const newAssignment = {
    id: Date.now(),
    status: STATUS.SUBMITTED,
    uploadedAt: new Date().toISOString(),
    feedback: null,
    comments: [],
    ...assignment,
  };
  assignments.push(newAssignment);
  saveAssignments(assignments);
  return newAssignment;
};

export const addComment = (assignmentId, comment) => {
  const assignments = loadAssignments();
  const updated = assignments.map((a) =>
    a.id === assignmentId
      ? { ...a, comments: [...(a.comments || []), comment] }
      : a
  );
  saveAssignments(updated);
  return updated;
};

export const updateAssignment = (assignmentId, updatedFields) => {
  const assignments = loadAssignments();
  const updated = assignments.map((a) =>
    a.id === assignmentId ? { ...a, ...updatedFields } : a
  );
  saveAssignments(updated);
  return updated;
};

export const clearAllAssignments = () => {
  localStorage.removeItem("assignments");
};
