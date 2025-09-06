// src/utils/auth.js
import { fetchAuthSession } from "aws-amplify/auth";

export async function getAuthToken() {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString(); // ia token-ul ID
  } catch (err) {
    console.error("Error fetching auth token:", err);
    return null;
  }
}
