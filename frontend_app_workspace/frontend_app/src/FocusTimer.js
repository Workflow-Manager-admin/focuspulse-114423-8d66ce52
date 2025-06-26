import React, { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";

/**
 * Component for the Pomodoro timer and viewing/logging session history.
 * @param {object} user - Supabase user object of the current session.
 * @param {function} onLogout - Callback to log out.
 */
export default function FocusTimer({ user, onLogout }) {
  const FOCUS_MINUTES = 25;
  const BREAK_MINUTES = 5;

  const [mode, setMode] = useState("focus"); // 'focus' | 'break'
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_MINUTES * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [sessionLogs, setSessionLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [error, setError] = useState("");

  const intervalRef = useRef();

  // Fetch session logs on mount and whenever user changes
  useEffect(() => {
    let mounted = true;
    async function fetchLogs() {
      setLoadingLogs(true);
      setError("");
      const { data, error } = await supabase
        .from("sessions")
        .select("id, mode, start_time, end_time")
        .eq("user_id", user.id)
        .order("start_time", { ascending: false })
        .limit(10);
      if (mounted) {
        if (error) setError("Failed to load session history.");
        else setSessionLogs(data || []);
        setLoadingLogs(false);
      }
    }
    fetchLogs();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Timer logic
  useEffect(() => {
    if (!timerRunning) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current);
          handlePeriodEnd();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerRunning]);

  // PUBLIC_INTERFACE
  async function startTimer() {
    setError("");
    setTimerRunning(true);
    if (!sessionId) {
      // Start new session log in Supabase
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("sessions")
        .insert([
          {
            user_id: user.id,
            mode,
            start_time: now,
            end_time: null,
          },
        ])
        .select();
      if (error) setError("Error logging session.");
      else if (data && data.length > 0) setSessionId(data[0].id);
    }
  }

  // PUBLIC_INTERFACE
  async function stopTimer() {
    setTimerRunning(false);
    clearInterval(intervalRef.current);

    // Update Supabase session end_time if session in progress
    if (sessionId) {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from("sessions")
        .update({ end_time: now })
        .eq("id", sessionId)
        .eq("user_id", user.id);
      if (error) setError("Failed to update session log.");
      setSessionId(null);
      // Refresh session logs
      refreshLogs();
    }
  }

  // PUBLIC_INTERFACE
  function resetTimer() {
    setTimerRunning(false);
    clearInterval(intervalRef.current);
    setSecondsLeft(mode === "focus" ? FOCUS_MINUTES * 60 : BREAK_MINUTES * 60);
    setSessionId(null);
    setError("");
  }

  // Called when period ends naturally
  async function handlePeriodEnd() {
    setTimerRunning(false);
    // Update session log
    if (sessionId) {
      const now = new Date().toISOString();
      await supabase
        .from("sessions")
        .update({ end_time: now })
        .eq("id", sessionId)
        .eq("user_id", user.id);
      setSessionId(null);
      refreshLogs();
    }
    if (mode === "focus") {
      setMode("break");
      setSecondsLeft(BREAK_MINUTES * 60);
    } else {
      setMode("focus");
      setSecondsLeft(FOCUS_MINUTES * 60);
    }
  }

  // PUBLIC_INTERFACE
  async function skipPeriod() {
    setTimerRunning(false);
    clearInterval(intervalRef.current);
    await handlePeriodEnd();
  }

  // PUBLIC_INTERFACE
  async function refreshLogs() {
    setLoadingLogs(true);
    const { data, error } = await supabase
      .from("sessions")
      .select("id, mode, start_time, end_time")
      .eq("user_id", user.id)
      .order("start_time", { ascending: false })
      .limit(10);
    if (error) {
      setError("Could not refresh session history.");
    } else {
      setSessionLogs(data || []);
    }
    setLoadingLogs(false);
  }

  function pad(v) {
    return v < 10 ? "0" + v : v;
  }

  const mins = pad(Math.floor(secondsLeft / 60));
  const secs = pad(secondsLeft % 60);

  return (
    <div className="focus-container">
      <div className="userbar">
        <span className="user-email">{user.email}</span>
        <button className="btn btn-main btn-logout" onClick={onLogout}>
          Logout
        </button>
      </div>
      <h1 className="title">FocusTimer</h1>
      <div className="timer-card" tabIndex={0} aria-label="Pomodoro Timer">
        <span className={`timer-label ${mode}`}>
          {mode === "focus" ? "Focus" : "Break"}
        </span>
        <span className="timer-time">
          {mins}:{secs}
        </span>
        <div className="timer-controls">
          {timerRunning ? (
            <button className="btn btn-danger" onClick={stopTimer}>
              Stop
            </button>
          ) : (
            <button className="btn btn-main" onClick={startTimer}>
              Start
            </button>
          )}
          <button className="btn btn-secondary" onClick={resetTimer}>
            Reset
          </button>
          <button className="btn btn-tertiary" onClick={skipPeriod}>
            Skip
          </button>
        </div>
      </div>
      {error && <div className="error-msg">{error}</div>}
      <section className="session-history">
        <h2 className="subtitle">Your Recent Sessions</h2>
        {loadingLogs ? (
          <div>Loading...</div>
        ) : sessionLogs.length === 0 ? (
          <div>No recent sessions.</div>
        ) : (
          <table className="session-table" aria-label="Session Log">
            <thead>
              <tr>
                <th>Type</th>
                <th>Start</th>
                <th>End</th>
              </tr>
            </thead>
            <tbody>
              {sessionLogs.map((log) => (
                <tr key={log.id}>
                  <td>{log.mode.charAt(0).toUpperCase() + log.mode.slice(1)}</td>
                  <td>{log.start_time ? new Date(log.start_time).toLocaleString() : "-"}</td>
                  <td>
                    {log.end_time
                      ? new Date(log.end_time).toLocaleString()
                      : sessionId === log.id
                      ? "Active"
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
