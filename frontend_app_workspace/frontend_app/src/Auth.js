import React, { useState } from "react";
import { supabase } from "./supabaseClient";

/**
 * Minimalist authentication view for login/signup/logout.
 */
export default function Auth({ onAuth }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // PUBLIC_INTERFACE
  async function handleAuth(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const fn = isSignUp ? supabase.auth.signUp : supabase.auth.signInWithPassword;
      const { data, error } = await fn({ email, password });
      if (error) throw error;
      if (onAuth) onAuth();
    } catch (err) {
      setErrorMsg(err.message || "Authentication error.");
    } finally {
      setLoading(false);
    }
  }

  // PUBLIC_INTERFACE
  function switchMode(e) {
    e.preventDefault();
    setIsSignUp((v) => !v);
    setErrorMsg("");
  }

  return (
    <div className="auth-container">
      <h2 className="title">{isSignUp ? "Sign Up" : "Login"}</h2>
      <form className="auth-form" onSubmit={handleAuth}>
        <input
          type="email"
          className="input"
          placeholder="Email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <input
          type="password"
          className="input"
          placeholder="Password"
          required
          autoComplete={isSignUp ? "new-password" : "current-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          disabled={loading}
        />
        <button type="submit" className="btn btn-main" disabled={loading}>
          {loading ? (isSignUp ? "Signing up..." : "Logging in...") : isSignUp ? "Sign up" : "Log in"}
        </button>
        {errorMsg && <div className="error-msg">{errorMsg}</div>}
      </form>
      <div className="auth-switch">
        {isSignUp ? "Have an account?" : "Need an account?"}{" "}
        <button className="link" onClick={switchMode} disabled={loading}>
          {isSignUp ? "Log in" : "Sign up"}
        </button>
      </div>
    </div>
  );
}
