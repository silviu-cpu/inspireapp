import React, { useState } from "react";
import { Amplify } from "aws-amplify";
import {
  signIn,
  signUp,
  confirmSignUp,
  signOut,
  resendSignUpCode,
  fetchAuthSession,
} from "@aws-amplify/auth";
import awsConfig from "../../aws-exports";
import { useNavigate } from "react-router-dom";

// Configure Amplify
Amplify.configure(awsConfig);

export default function AuthPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState("");

  const navigate = useNavigate();

  const handleResendCode = async () => {
    try {
      if (!email) {
        setError("Please enter your email first");
        return;
      }
      await resendSignUpCode({ username: email });
      setIsConfirming(true);
      setUserId(email);
      setError("New confirmation code sent!");
    } catch (err) {
      setError(err.message || "Failed to resend code");
    }
  };

  const handleSignUp = async () => {
    try {
      const result = await signUp({
        username: email,
        password,
        attributes: { email },
      });
      setUserId(result.userId);
      setIsConfirming(true);
      setError("");
    } catch (err) {
      if (err.name === "UsernameExistsException") {
        setError("User already exists. Try login or resend code.");
        setIsConfirming(true);
        setUserId(email);
      } else {
        setError(err.message || "Sign up failed");
      }
    }
  };

  const handleConfirmSignUp = async () => {
    try {
      await confirmSignUp({
        username: userId || email,
        confirmationCode: confirmationCode,
      });
      setError("Account confirmed! You can now log in.");
      setIsConfirming(false);
    } catch (err) {
      setError(err.message || "Confirmation failed");
    }
  };

  const handleLogin = async () => {
    try {
      // First, clean any existing session
      try {
        await signOut();
      } catch (signOutError) {
        console.log("No existing session to sign out");
      }

      // Sign in the user
      console.log("Attempting to sign in:", email);
      const signInResult = await signIn({
        username: email,
        password: password,
      });

      console.log("Sign in successful:", signInResult);
      // Store current user for Student dashboard
      localStorage.setItem("currentUser", email); // <-- ADD THIS LINE
      // Get the session and extract groups
      const session = await fetchAuthSession();
      console.log("Session:", session);

      const idToken = session.tokens?.idToken?.payload;
      console.log("ID Token payload:", idToken);

      const groups = idToken["cognito:groups"] || [];
      console.log("User groups:", groups);

      // Determine role based on groups
      const role = groups.includes("teacher") ? "teacher" : "student";
      console.log("Determined role:", role);

      // Call the onLogin callback
      onLogin({ username: email, role });

      // Navigate based on role
      if (role === "teacher") {
        navigate("/");
      } else {
        navigate("/");
      }

      setError("");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
    }
  };

  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center vh-100"
      style={{ backgroundColor: "#f5f5f5" }}
    >
      <div
        className="card shadow-lg p-4"
        style={{ maxWidth: "420px", width: "100%" }}
      >
        <div className="text-center mb-4">
          <h2 className="fw-bold">Welcome to Academia Inspire Portal</h2>
          <p className="text-muted">
            Sign in or create your account to continue
          </p>
        </div>

        {!isConfirming ? (
          <>
            <div className="mb-3">
              <input
                type="email"
                placeholder="Email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <input
                type="password"
                placeholder="Password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="d-grid gap-2 mb-2">
              <button className="btn btn-success" onClick={handleLogin}>
                Login
              </button>
              <button className="btn btn-primary" onClick={handleSignUp}>
                Sign Up
              </button>
              <button
                className="btn btn-outline-info"
                onClick={handleResendCode}
              >
                Resend Code
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-center mb-3">
              Enter confirmation code sent to your email:
            </p>
            <input
              type="text"
              placeholder="6-digit code"
              className="form-control mb-3"
              value={confirmationCode}
              onChange={(e) =>
                setConfirmationCode(
                  e.target.value.replace(/\D/g, "").slice(0, 6)
                )
              }
              maxLength="6"
            />
            <div className="d-grid gap-2">
              <button
                className="btn btn-primary"
                onClick={handleConfirmSignUp}
                disabled={confirmationCode.length !== 6}
              >
                Confirm Sign Up
              </button>
              <button className="btn btn-warning" onClick={handleResendCode}>
                Resend New Code
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  setIsConfirming(false);
                  setConfirmationCode("");
                  setError("");
                }}
              >
                Back to Login
              </button>
            </div>
          </>
        )}

        {error && <p className="text-danger mt-3 text-center">{error}</p>}
      </div>
    </div>
  );
}
