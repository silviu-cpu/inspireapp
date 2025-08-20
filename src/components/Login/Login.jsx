import React, { useState } from "react";
import { Amplify } from "aws-amplify";
import {
  signIn,
  signUp,
  confirmSignUp,
  signOut,
  getCurrentUser,
  resendSignUpCode,
} from "@aws-amplify/auth";
import awsConfig from "../../aws-exports";

// Configure Amplify
Amplify.configure(awsConfig);

export default function AuthPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(""); // Changed from userSub to userId

  // Clear any existing session
  const handleClearSession = async () => {
    try {
      await signOut();
      console.log("Session cleared successfully");
      setError("Session cleared. You can now log in.");
    } catch (err) {
      console.log("No session to clear or error:", err.message);
      setError("No active session found.");
    }
  };

  // Debug function to check current user
  const handleCheckCurrentUser = async () => {
    try {
      const user = await getCurrentUser();
      console.log("Current user:", user);
      setError(`Current user: ${user.username}`);
    } catch (err) {
      console.log("No current user:", err.message);
      setError("No current user found.");
    }
  };

  // Force clear everything
  const handleForceReset = () => {
    localStorage.clear();
    sessionStorage.clear();
    setError("Storage cleared. Refresh the page.");
  };

  // Resend confirmation code for existing user
  const handleResendCode = async () => {
    try {
      if (!email) {
        setError("Please enter your email first");
        return;
      }

      console.log("Resending confirmation code for:", email);
      await resendSignUpCode({ username: email });
      setUserId(email);
      setIsConfirming(true);
      setConfirmationCode(""); // Clear the old code
      setError(
        "New confirmation code sent! Check your email (including spam folder)."
      );
    } catch (err) {
      console.error("Resend code error:", err);
      setError(err.message || "Failed to resend code");
    }
  };

  // Sign up new user
  const handleSignUp = async () => {
    try {
      console.log("Attempting SignUp for email:", email);
      const result = await signUp({
        username: email, // can use email here, Cognito will still assign UUID
        password,
        attributes: { email },
      });
      console.log("SignUp result:", result);
      setUserId(result.userId); // Store userId instead of userSub
      setIsConfirming(true); // show confirmation input
      setError("");
    } catch (err) {
      console.error("SignUp error:", err);

      if (err.name === "UsernameExistsException") {
        // User exists but might not be confirmed
        setError(
          "User already exists. Try logging in or resend confirmation code."
        );
        // Automatically switch to confirmation mode
        setIsConfirming(true);
        setUserId(email); // Use email as userId for existing user
      } else {
        setError(err.message || "Sign up failed");
      }
    }
  };

  // Confirm sign up using userId
  const handleConfirmSignUp = async () => {
    try {
      console.log(
        "ConfirmSignUp triggered for username (userId):",
        userId,
        "code:",
        confirmationCode
      );
      await confirmSignUp({
        username: userId || email, // Use userId if available, otherwise email
        confirmationCode: confirmationCode,
      });
      console.log("ConfirmSignUp success");
      setError("Account confirmed successfully! You can now log in.");
      setIsConfirming(false); // Go back to login form
    } catch (err) {
      console.error("ConfirmSignUp error:", err);
      setError(err.message || "Confirmation failed");
    }
  };

  // Login user
  const handleLogin = async () => {
    try {
      // First, try to sign out any existing session
      try {
        await signOut();
        console.log("Existing session signed out");
      } catch (signOutError) {
        console.log("No existing session to sign out:", signOutError.message);
      }

      console.log("Attempting Login for userId:", userId, "email:", email);
      // For login, you might need to use email instead of userId depending on your Cognito setup
      const user = await signIn({
        username: email, // Try using email first
        password: password,
      });
      const role = user.signInDetails?.loginId || "student";
      console.log("Login success:", user);
      onLogin({ username: email, role }); // Use email as username
      setError("");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
    }
  };

  return (
    <div
      className="card p-3"
      style={{ maxWidth: "400px", margin: "50px auto" }}
    >
      <div className="card-header text-center">Authentication</div>
      <div className="card-body d-flex flex-column">
        {!isConfirming ? (
          <>
            <input
              type="email"
              placeholder="Email"
              className="form-control mb-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="form-control mb-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="btn btn-primary mt-2" onClick={handleSignUp}>
              Sign Up
            </button>
            <button className="btn btn-success mt-2" onClick={handleLogin}>
              Login
            </button>
            <button className="btn btn-info mt-2" onClick={handleResendCode}>
              Resend Code
            </button>
            <button
              className="btn btn-warning mt-2"
              onClick={handleClearSession}
            >
              Clear Session
            </button>
            <button
              className="btn btn-secondary mt-2"
              onClick={handleCheckCurrentUser}
            >
              Check User
            </button>
            <button className="btn btn-danger mt-2" onClick={handleForceReset}>
              Force Reset
            </button>
          </>
        ) : (
          <>
            <p>Enter the confirmation code sent to your email:</p>
            <p className="small text-muted">
              Code expires in 24 hours. Check spam folder if not received.
            </p>
            <input
              type="text"
              placeholder="6-digit confirmation code"
              className="form-control mb-2"
              value={confirmationCode}
              onChange={(e) =>
                setConfirmationCode(
                  e.target.value.replace(/\D/g, "").slice(0, 6)
                )
              }
              maxLength="6"
            />
            <button
              className="btn btn-primary mt-2"
              onClick={handleConfirmSignUp}
              disabled={confirmationCode.length !== 6}
            >
              Confirm Sign Up
            </button>
            <button className="btn btn-warning mt-2" onClick={handleResendCode}>
              Resend New Code
            </button>
            <button
              className="btn btn-outline-secondary mt-2"
              onClick={() => {
                setIsConfirming(false);
                setConfirmationCode("");
                setError("");
              }}
            >
              Back to Login
            </button>
          </>
        )}
        {error && <p className="text-danger mt-2">{error}</p>}
      </div>
    </div>
  );
}
