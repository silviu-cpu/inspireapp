// src/utils/api.js
const API_URL = process.env.REACT_APP_API_URL; // Variabila de mediu
console.log("APIURL", API_URL);
// Ajută la debug: verifică dacă URL-ul e setat
if (!API_URL) {
  console.error("REACT_APP_API_URL nu este setat. Verifică .env!");
}

// GET - ia toate assignments
export async function getAssignments() {
  const res = await fetch(`${API_URL}/api`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const text = await res.text(); // citește răspunsul ca text
  try {
    return JSON.parse(text); // încearcă să parsezi JSON
  } catch (err) {
    console.error("Răspuns invalid JSON:", text);
    throw new Error("Failed to fetch assignments (invalid JSON)");
  }
}

// POST - creează un assignment nou
export async function createAssignment(assignment) {
  const res = await fetch(`${API_URL}/api`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(assignment),
  });

  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("Răspuns invalid JSON:", text);
    throw new Error("Failed to create assignment (invalid JSON)");
  }
}

// PUT - update assignment
export async function updateAssignment(assignment) {
  const res = await fetch(`${API_URL}/api`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(assignment),
  });

  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("Răspuns invalid JSON:", text);
    throw new Error("Failed to update assignment (invalid JSON)");
  }
}

// POST - adaugă comentariu
export async function addCommentApi(Name, user, message) {
  const res = await fetch(`${API_URL}/api/${Name}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user, message }),
  });

  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("Răspuns invalid JSON:", text);
    throw new Error("Failed to add comment (invalid JSON)");
  }
}

// DELETE - șterge assignment
export async function deleteAssignment(Name) {
  const res = await fetch(`${API_URL}/api/${Name}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("Răspuns invalid JSON:", text);
    throw new Error("Failed to delete assignment (invalid JSON)");
  }
}
