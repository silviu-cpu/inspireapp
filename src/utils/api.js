// src/utils/api.js
import { getAuthToken } from "./auth";

const API_URL = "https://e5llhw03bf.execute-api.eu-north-1.amazonaws.com/dev"; // înlocuiește cu al tău dacă diferă

// GET - ia toate assignments
export async function getAssignments() {
  const token = await getAuthToken();
  if (!token) throw new Error("No auth token found");

  const res = await fetch(`${API_URL}/api`, {
    method: "GET",
    headers: {
      Authorization: token, // trimite tokenul Cognito
    },
  });

  if (!res.ok) throw new Error("Failed to fetch assignments");
  return res.json();
}

// POST - creează un assignment nou
export async function createAssignment(assignment) {
  const token = await getAuthToken();
  if (!token) throw new Error("No auth token found");

  const res = await fetch(`${API_URL}/api`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify(assignment),
  });

  if (!res.ok) throw new Error("Failed to create assignment");
  return res.json();
}

// PUT - update assignment
export async function updateAssignment(assignment) {
  const token = await getAuthToken();
  if (!token) throw new Error("No auth token found");

  const res = await fetch(`${API_URL}/api`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify(assignment),
  });

  if (!res.ok) throw new Error("Failed to update assignment");
  return res.json();
}

// DELETE - șterge assignment
export async function deleteAssignment(name) {
  const token = await getAuthToken();
  if (!token) throw new Error("No auth token found");

  const res = await fetch(`${API_URL}/api/object/${name}`, {
    method: "DELETE",
    headers: {
      Authorization: token,
    },
  });

  if (!res.ok) throw new Error("Failed to delete assignment");
  return res.json();
}
