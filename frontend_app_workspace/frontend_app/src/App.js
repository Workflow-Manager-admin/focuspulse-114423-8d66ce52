import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Auth from "./Auth";
import FocusTimer from "./FocusTimer";
import "./App.css";

/**
 * Root App: Handles theme switch, supabase user session, minimal global layout.
 */
function App() {
  const [theme, setTheme] = useState("light");
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // On mount: Fetch user session and listen for auth changes
  useEffect(() => {
    let ignore = false;
    supabase.auth.getUser().then(({ data }) => {
      if (!ignore) {
        setUser(data?.user);
        setAuthChecked(true);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });
    return () => {
      ignore = true;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  };

  // PUBLIC_INTERFACE
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <div className="App">
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      >
        {theme === "light" ? "🌙 Dark" : "☀️ Light"}
      </button>
      <main>
        <section className="central-content">
          {!authChecked ? (
            <div className="loading">Loading...</div>
          ) : user ? (
            <FocusTimer user={user} onLogout={handleLogout} />
          ) : (
            <Auth onAuth={() => supabase.auth.getUser().then(({ data }) => setUser(data?.user))} />
          )}
        </section>
        <footer className="footer">
          <span>
            FocusTimer &copy; {new Date().getFullYear()} | Powered by Supabase & React
          </span>
        </footer>
      </main>
    </div>
  );
}

export default App;
