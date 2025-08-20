export const STATUS = {
  SUBMITTED: "SUBMITTED",
  ACCEPTED: "ACCEPTED",
  REVISION_REQUIRED: "REVISION_REQUIRED",
};

export const loadAssignments = () => {
  return JSON.parse(localStorage.getItem("assignments") || "[]");
};

export const saveAssignments = (assignments) => {
  localStorage.setItem("assignments", JSON.stringify(assignments));
};
